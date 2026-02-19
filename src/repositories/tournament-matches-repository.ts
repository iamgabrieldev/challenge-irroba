import { Team, TournamentMatch } from '@prisma/client';

export type TournamentMatchWithRelations = TournamentMatch & {
  homeTeam: Team;
  awayTeam: Team;
  winner: Team | null;
};

export interface TournamentMatchesRepository {
  create(data: {
    tournamentId: string;
    homeTeamId: string;
    awayTeamId: string;
    phase: string;
    matchOrder: number;
    homeScore?: number;
    awayScore?: number;
    winnerId?: string;
  }): Promise<TournamentMatch>;
  findManyByTournamentId(
    tournamentId: string
  ): Promise<TournamentMatchWithRelations[]>;
}
