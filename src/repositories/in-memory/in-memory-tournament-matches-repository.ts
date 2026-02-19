import { randomUUID } from 'node:crypto';
import { Team, TournamentMatch } from '@prisma/client';
import { TeamsRepository } from '@/repositories/teams-repository';
import { TournamentMatchesRepository } from '@/repositories/tournament-matches-repository';

export class InMemoryTournamentMatchesRepository
  implements TournamentMatchesRepository
{
  public items: TournamentMatch[] = [];

  constructor(private teamsRepository?: TeamsRepository) {}

  async create(data: {
    tournamentId: string;
    homeTeamId: string;
    awayTeamId: string;
    phase: string;
    matchOrder: number;
    homeScore?: number;
    awayScore?: number;
    winnerId?: string;
  }) {
    const match: TournamentMatch = {
      id: randomUUID(),
      tournamentId: data.tournamentId,
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      homeScore: data.homeScore ?? null,
      awayScore: data.awayScore ?? null,
      winnerId: data.winnerId ?? null,
      phase: data.phase,
      matchOrder: data.matchOrder,
      createdAt: new Date(),
    };
    this.items.push(match);
    return match;
  }

  async findManyByTournamentId(tournamentId: string) {
    const items = this.items.filter(
      (item) => item.tournamentId === tournamentId
    );
    if (!this.teamsRepository) return items;
    return Promise.all(
      items.map(async (m) => {
        const homeTeam = await this.teamsRepository!.findById(m.homeTeamId);
        const awayTeam = await this.teamsRepository!.findById(m.awayTeamId);
        const winner = m.winnerId
          ? await this.teamsRepository!.findById(m.winnerId)
          : null;
        return {
          ...m,
          homeTeam: homeTeam!,
          awayTeam: awayTeam!,
          winner,
        };
      })
    );
  }
}
