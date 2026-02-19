import { prisma } from '@/lib/prisma';
import { TeamsRepository } from '@/repositories/teams-repository';

export class PrismaTeamsRepository implements TeamsRepository {
  async create(data: { name: string }) {
    return prisma.team.create({ data });
  }

  async findById(id: string) {
    return prisma.team.findUnique({ where: { id } });
  }

  async findMany() {
    return prisma.team.findMany({ orderBy: { createdAt: 'asc' } });
  }
}
