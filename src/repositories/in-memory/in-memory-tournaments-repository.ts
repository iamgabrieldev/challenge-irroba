import { randomUUID } from 'node:crypto';
import { Tournament } from '@prisma/client';
import { TournamentsRepository } from '@/repositories/tournaments-repository';

export class InMemoryTournamentsRepository implements TournamentsRepository {
  public items: Tournament[] = [];

  async create(data: { name?: string; status?: string }) {
    const tournament: Tournament = {
      id: randomUUID(),
      name: data.name ?? null,
      status: data.status ?? 'PENDING',
      createdAt: new Date(),
    };
    this.items.push(tournament);
    return tournament;
  }

  async findById(id: string) {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findMany() {
    return [...this.items].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async update(id: string, data: { name?: string; status?: string }) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Tournament not found');
    this.items[index] = {
      ...this.items[index],
      ...(data.name !== undefined && { name: data.name }),
      ...(data.status !== undefined && { status: data.status }),
    };
    return this.items[index];
  }
}
