import { Tournament } from '@prisma/client';
import { TournamentsRepository } from '@/repositories/tournaments-repository';
import { TournamentTeamsRepository } from '@/repositories/tournament-teams-repository';
import { TeamsRepository } from '@/repositories/teams-repository';
import { InvalidTeamsCountError } from './errors/invalid-teams-count-error';

const REQUIRED_TEAMS = 8;

interface CreateTournamentWithTeamsUseCaseRequest {
  teamIds: string[];
}

interface CreateTournamentWithTeamsUseCaseResponse {
  tournament: Tournament;
}

export class CreateTournamentWithTeamsUseCase {
  constructor(
    private tournamentsRepository: TournamentsRepository,
    private tournamentTeamsRepository: TournamentTeamsRepository,
    private teamsRepository: TeamsRepository
  ) {}

  async execute({
    teamIds,
  }: CreateTournamentWithTeamsUseCaseRequest): Promise<CreateTournamentWithTeamsUseCaseResponse> {
    if (teamIds.length !== REQUIRED_TEAMS) {
      throw new InvalidTeamsCountError();
    }

    for (const teamId of teamIds) {
      const team = await this.teamsRepository.findById(teamId);
      if (!team) throw new Error(`Team ${teamId} not found`);
    }

    const tournament = await this.tournamentsRepository.create({});

    for (let i = 0; i < teamIds.length; i++) {
      await this.tournamentTeamsRepository.create({
        tournamentId: tournament.id,
        teamId: teamIds[i],
        inscriptionOrder: i,
      });
    }

    return { tournament };
  }
}
