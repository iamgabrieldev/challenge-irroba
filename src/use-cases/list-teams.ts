import { Team } from '@prisma/client';
import { TeamsRepository } from '@/repositories/teams-repository';

interface ListTeamsUseCaseResponse {
  teams: Team[];
}

export class ListTeamsUseCase {
  constructor(private teamsRepository: TeamsRepository) {}

  async execute(): Promise<ListTeamsUseCaseResponse> {
    const teams = await this.teamsRepository.findMany();
    return { teams };
  }
}
