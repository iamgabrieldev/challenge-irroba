import { Team } from '@prisma/client';
import { ScoreGenerator } from '@/lib/python-score-generator';
import { TournamentsRepository } from '@/repositories/tournaments-repository';
import { TournamentTeamsRepository } from '@/repositories/tournament-teams-repository';
import { TournamentMatchesRepository } from '@/repositories/tournament-matches-repository';
import { InvalidTeamsCountError } from './errors/invalid-teams-count-error';
import { TournamentNotFoundError } from './errors/tournament-not-found-error';
import { PHASES } from './domain/bracket';
import {
  TiebreakerContext,
  TiebreakerStrategy,
  PontuacaoStrategy,
  PenaltyStrategy,
  OrdemInscricaoStrategy,
} from './domain/tiebreaker-strategy';

const REQUIRED_TEAMS = 8;

interface SimulateTournamentUseCaseRequest {
  tournamentId: string;
}

interface SimulateTournamentUseCaseResponse {
  tournamentId: string;
  championId: string;
}

export class SimulateTournamentUseCase {
  private tiebreakerStrategies: TiebreakerStrategy[];

  constructor(
    private tournamentsRepository: TournamentsRepository,
    private tournamentTeamsRepository: TournamentTeamsRepository,
    private tournamentMatchesRepository: TournamentMatchesRepository,
    private scoreGenerator: ScoreGenerator
  ) {
    this.tiebreakerStrategies = [
      new PontuacaoStrategy(),
      new PenaltyStrategy(scoreGenerator),
      new OrdemInscricaoStrategy(),
    ];
  }

  async execute({
    tournamentId,
  }: SimulateTournamentUseCaseRequest): Promise<SimulateTournamentUseCaseResponse> {
    const tournament = await this.tournamentsRepository.findById(tournamentId);
    if (!tournament) throw new TournamentNotFoundError();

    const ttList = await this.tournamentTeamsRepository.findManyByTournamentId(
      tournamentId
    );
    const teams = ttList
      .sort((a, b) => a.inscriptionOrder - b.inscriptionOrder)
      .map((tt) => tt.team);

    if (teams.length !== REQUIRED_TEAMS) {
      throw new InvalidTeamsCountError();
    }

    const scores = new Map<string, number>();
    teams.forEach((t) => scores.set(t.id, 0));

    const teamsWithOrder = teams.map((t, i) => ({
      id: t.id,
      inscriptionOrder: i,
    }));

    const getWinner = async (
      homeId: string,
      awayId: string,
      homeScore: number,
      awayScore: number
    ): Promise<string> => {
      if (homeScore > awayScore) return homeId;
      if (awayScore > homeScore) return awayId;

      const context: TiebreakerContext = {
        scores,
        teams: teamsWithOrder,
        homeId,
        awayId,
        homeScore,
        awayScore,
      };

      for (const strategy of this.tiebreakerStrategies) {
        const winner = await strategy.resolve(context);
        if (winner) return winner;
      }

      return teamsWithOrder.find((t) => t.id === homeId)!.inscriptionOrder <=
        teamsWithOrder.find((t) => t.id === awayId)!.inscriptionOrder
        ? homeId
        : awayId;
    };

    const updateScores = (
      homeId: string,
      awayId: string,
      homeScore: number,
      awayScore: number
    ) => {
      scores.set(homeId, (scores.get(homeId) ?? 0) + homeScore - awayScore);
      scores.set(awayId, (scores.get(awayId) ?? 0) + awayScore - homeScore);
    };

    const winners: (string | null)[] = [];
    const losers: (string | null)[] = [];

    const playMatch = async (
      homeId: string,
      awayId: string,
      phase: string,
      matchOrder: number
    ) => {
      const [homeScore, awayScore] = await this.scoreGenerator.generate();
      updateScores(homeId, awayId, homeScore, awayScore);
      const winnerId = await getWinner(homeId, awayId, homeScore, awayScore);
      await this.tournamentMatchesRepository.create({
        tournamentId,
        homeTeamId: homeId,
        awayTeamId: awayId,
        phase,
        matchOrder,
        homeScore,
        awayScore,
        winnerId,
      });
      return winnerId;
    };

    for (let i = 0; i < 4; i++) {
      const homeId = teams[i * 2].id;
      const awayId = teams[i * 2 + 1].id;
      const winnerId = await playMatch(
        homeId,
        awayId,
        PHASES.QUARTER_FINAL,
        i
      );
      winners.push(winnerId);
      losers.push(homeId === winnerId ? awayId : homeId);
    }

    const semi0Home = winners[0]!;
    const semi0Away = winners[1]!;
    const semi0Winner = await playMatch(
      semi0Home,
      semi0Away,
      PHASES.SEMI_FINAL,
      0
    );
    const semi0Loser = semi0Home === semi0Winner ? semi0Away : semi0Home;

    const semi1Home = winners[2]!;
    const semi1Away = winners[3]!;
    const semi1Winner = await playMatch(
      semi1Home,
      semi1Away,
      PHASES.SEMI_FINAL,
      1
    );
    const semi1Loser = semi1Home === semi1Winner ? semi1Away : semi1Home;

    await playMatch(semi0Loser, semi1Loser, PHASES.THIRD_PLACE, 0);
    const championId = await playMatch(
      semi0Winner,
      semi1Winner,
      PHASES.FINAL,
      0
    );

    await this.tournamentsRepository.update(tournamentId, {
      status: 'FINISHED',
    });

    return { tournamentId, championId };
  }
}
