import { prisma } from '@/lib/prisma';
import { TournamentsRepository } from '@/repositories/tournaments-repository';

export class PrismaTournamentsRepository implements TournamentsRepository {
  async create(data: { name?: string; status?: string }) {
    return prisma.tournament.create({
      data: { name: data.name, status: data.status ?? 'PENDING' },
    });
  }

  async findById(id: string) {
    return prisma.tournament.findUnique({
      where: { id },
      include: { matches: true, teams: { include: { team: true } } },
    });
  }

  async findMany() {
    return prisma.tournament.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async update(id: string, data: { name?: string; status?: string }) {
    return prisma.tournament.update({ where: { id }, data });
  }
}
