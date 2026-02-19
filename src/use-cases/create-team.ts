import { Team } from '@prisma/client';
import { TeamsRepository } from '@/repositories/teams-repository';

interface CreateTeamUseCaseRequest {
  name: string;
}

interface CreateTeamUseCaseResponse {
  team: Team;
}

export class CreateTeamUseCase {
  constructor(private teamsRepository: TeamsRepository) {}

  async execute({
    name,
  }: CreateTeamUseCaseRequest): Promise<CreateTeamUseCaseResponse> {
    const team = await this.teamsRepository.create({ name });
    return { team };
  }
}
