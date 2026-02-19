import { Team } from '@prisma/client';

export interface TeamsRepository {
  create(data: { name: string }): Promise<Team>;
  findById(id: string): Promise<Team | null>;
  findMany(): Promise<Team[]>;
}
