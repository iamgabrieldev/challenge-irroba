import { prisma } from '@/lib/prisma';
import { TournamentTeamsRepository } from '@/repositories/tournament-teams-repository';

export class PrismaTournamentTeamsRepository
  implements TournamentTeamsRepository
{
  async create(data: {
    tournamentId: string;
    teamId: string;
    inscriptionOrder: number;
  }) {
    return prisma.tournamentTeam.create({ data });
  }

  async findManyByTournamentId(tournamentId: string) {
    return prisma.tournamentTeam.findMany({
      where: { tournamentId },
      include: { team: true },
      orderBy: { inscriptionOrder: 'asc' },
    });
  }
}
