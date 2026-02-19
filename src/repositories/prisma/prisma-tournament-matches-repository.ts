import { prisma } from '@/lib/prisma';
import { TournamentMatchesRepository } from '@/repositories/tournament-matches-repository';

export class PrismaTournamentMatchesRepository
  implements TournamentMatchesRepository
{
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
    return prisma.tournamentMatch.create({
      data: {
        tournamentId: data.tournamentId,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        phase: data.phase,
        matchOrder: data.matchOrder,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        winnerId: data.winnerId,
      },
    });
  }

  async findManyByTournamentId(tournamentId: string) {
    return prisma.tournamentMatch.findMany({
      where: { tournamentId },
      include: { homeTeam: true, awayTeam: true, winner: true },
      orderBy: [{ phase: 'asc' }, { matchOrder: 'asc' }],
    });
  }
}
