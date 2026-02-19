import { TournamentsRepository } from '@/repositories/tournaments-repository';
import { TournamentMatchesRepository } from '@/repositories/tournament-matches-repository';
import { TournamentNotFoundError } from './errors/tournament-not-found-error';
import { PHASES } from './domain/bracket';

interface MatchResult {
  id: string;
  phase: string;
  matchOrder: number;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
  homeScore: number | null;
  awayScore: number | null;
  winner: { id: string; name: string } | null;
}

interface Podium {
  first: { id: string; name: string } | null;
  second: { id: string; name: string } | null;
  third: { id: string; name: string } | null;
}

interface GetTournamentResultUseCaseRequest {
  tournamentId: string;
}

interface GetTournamentResultUseCaseResponse {
  tournamentId: string;
  status: string;
  matches: MatchResult[];
  podium: Podium;
}

export class GetTournamentResultUseCase {
  constructor(
    private tournamentsRepository: TournamentsRepository,
    private tournamentMatchesRepository: TournamentMatchesRepository
  ) {}

  async execute({
    tournamentId,
  }: GetTournamentResultUseCaseRequest): Promise<GetTournamentResultUseCaseResponse> {
    const tournament = await this.tournamentsRepository.findById(tournamentId);
    if (!tournament) throw new TournamentNotFoundError();

    const matches = await this.tournamentMatchesRepository.findManyByTournamentId(
      tournamentId
    );

    const matchResults: MatchResult[] = matches.map((m) => ({
      id: m.id,
      phase: m.phase,
      matchOrder: m.matchOrder,
      homeTeam: {
        id: m.homeTeam.id,
        name: m.homeTeam.name,
      },
      awayTeam: {
        id: m.awayTeam.id,
        name: m.awayTeam.name,
      },
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      winner: m.winner
        ? { id: m.winner.id, name: m.winner.name }
        : null,
    }));

    const finalMatch = matches.find(
      (m) => m.phase === PHASES.FINAL && m.matchOrder === 0
    );
    const thirdPlaceMatch = matches.find(
      (m) => m.phase === PHASES.THIRD_PLACE && m.matchOrder === 0
    );

    const first = finalMatch?.winner ?? null;
    const second =
      finalMatch && finalMatch.winner
        ? (finalMatch.homeTeam.id === finalMatch.winner.id
            ? finalMatch.awayTeam
            : finalMatch.homeTeam)
        : null;
    const third = thirdPlaceMatch?.winner ?? null;

    const podium: Podium = {
      first: first ? { id: first.id, name: first.name } : null,
      second: second ? { id: second.id, name: second.name } : null,
      third: third ? { id: third.id, name: third.name } : null,
    };

    return {
      tournamentId,
      status: tournament.status,
      matches: matchResults,
      podium,
    };
  }
}
