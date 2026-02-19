import { Team, TournamentTeam } from '@prisma/client';

export type TournamentTeamWithTeam = TournamentTeam & { team: Team };

export interface TournamentTeamsRepository {
  create(data: {
    tournamentId: string;
    teamId: string;
    inscriptionOrder: number;
  }): Promise<TournamentTeam>;
  findManyByTournamentId(
    tournamentId: string
  ): Promise<TournamentTeamWithTeam[]>;
}
