import { randomUUID } from 'node:crypto';
import { Team } from '@prisma/client';
import { TeamsRepository } from '@/repositories/teams-repository';

export class InMemoryTeamsRepository implements TeamsRepository {
  public items: Team[] = [];

  async create(data: { name: string }) {
    const team: Team = {
      id: randomUUID(),
      name: data.name,
      createdAt: new Date(),
    };
    this.items.push(team);
    return team;
  }

  async findById(id: string) {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findMany() {
    return [...this.items].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }
}
