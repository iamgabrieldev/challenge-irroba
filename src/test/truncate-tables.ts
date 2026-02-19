import { prisma } from '@/lib/prisma';

export async function truncateTables() {
  const tables = [
    'TournamentMatch',
    'TournamentTeam',
    'Tournament',
    'Team',
  ];

  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "${tables.join('", "')}" CASCADE`
  );
}
