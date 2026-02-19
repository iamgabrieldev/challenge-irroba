import { Tournament } from '@prisma/client';

export type TournamentWithRelations = Tournament & {
  matches?: unknown[];
  teams?: unknown[];
};

export interface TournamentsRepository {
  create(data: { name?: string; status?: string }): Promise<Tournament>;
  findById(id: string): Promise<TournamentWithRelations | null>;
  findMany(): Promise<Tournament[]>;
  update(
    id: string,
    data: { name?: string; status?: string }
  ): Promise<Tournament>;
}
