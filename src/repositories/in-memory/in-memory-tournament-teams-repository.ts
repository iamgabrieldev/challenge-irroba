import { Team, TournamentTeam } from '@prisma/client';
import { TeamsRepository } from '@/repositories/teams-repository';
import { TournamentTeamsRepository } from '@/repositories/tournament-teams-repository';

export class InMemoryTournamentTeamsRepository
  implements TournamentTeamsRepository
{
  public items: TournamentTeam[] = [];

  constructor(private teamsRepository?: TeamsRepository) {}

  async create(data: {
    tournamentId: string;
    teamId: string;
    inscriptionOrder: number;
  }) {
    const tt: TournamentTeam = {
      tournamentId: data.tournamentId,
      teamId: data.teamId,
      inscriptionOrder: data.inscriptionOrder,
    };
    this.items.push(tt);
    return tt;
  }

  async findManyByTournamentId(tournamentId: string) {
    const items = this.items.filter((item) => item.tournamentId === tournamentId);
    if (!this.teamsRepository) {
      throw new Error('teamsRepository is required for findManyByTournamentId');
    }
    return Promise.all(
      items.map(async (tt) => {
        const team = await this.teamsRepository!.findById(tt.teamId);
        if (!team) throw new Error(`Team ${tt.teamId} not found`);
        return { ...tt, team };
      })
    );
  }
}
