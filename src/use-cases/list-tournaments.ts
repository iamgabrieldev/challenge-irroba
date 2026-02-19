import { Tournament } from '@prisma/client';
import { TournamentsRepository } from '@/repositories/tournaments-repository';

interface ListTournamentsUseCaseResponse {
  tournaments: Tournament[];
}

export class ListTournamentsUseCase {
  constructor(private tournamentsRepository: TournamentsRepository) {}

  async execute(): Promise<ListTournamentsUseCaseResponse> {
    const tournaments = await this.tournamentsRepository.findMany();
    return { tournaments };
  }
}
