import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTeamsRepository } from '@/repositories/in-memory/in-memory-teams-repository';
import { InMemoryTournamentsRepository } from '@/repositories/in-memory/in-memory-tournaments-repository';
import { InMemoryTournamentTeamsRepository } from '@/repositories/in-memory/in-memory-tournament-teams-repository';
import { InMemoryTournamentMatchesRepository } from '@/repositories/in-memory/in-memory-tournament-matches-repository';
import { GetTournamentResultUseCase } from './get-tournament-result';
import { SimulateTournamentUseCase } from './simulate-tournament';
import { TournamentNotFoundError } from './errors/tournament-not-found-error';
import type { ScoreGenerator } from '@/lib/python-score-generator';

function createMockScoreGenerator(
  results: [number, number][]
): ScoreGenerator {
  let i = 0;
  return {
    async generate() {
      return results[i++ % results.length] ?? [0, 0];
    },
  };
}

describe('GetTournamentResult Use Case', () => {
  it('should throw TournamentNotFoundError when tournament does not exist', async () => {
    const tournamentsRepo = new InMemoryTournamentsRepository();
    const matchesRepo = new InMemoryTournamentMatchesRepository();

    const sut = new GetTournamentResultUseCase(
      tournamentsRepo,
      matchesRepo
    );

    await expect(
      sut.execute({ tournamentId: 'non-existent' })
    ).rejects.toBeInstanceOf(TournamentNotFoundError);
  });

  it('should return tournament result with matches and podium', async () => {
    const teamsRepo = new InMemoryTeamsRepository();
    const tournamentsRepo = new InMemoryTournamentsRepository();
    const ttRepo = new InMemoryTournamentTeamsRepository(teamsRepo);
    const matchesRepo = new InMemoryTournamentMatchesRepository(teamsRepo);
    const scoreGen = createMockScoreGenerator([
      [2, 1],
      [1, 0],
      [3, 2],
      [0, 1],
      [2, 0],
      [1, 2],
      [1, 0],
      [2, 1],
    ]);

    const tournament = await tournamentsRepo.create({});
    for (let i = 0; i < 8; i++) {
      const team = await teamsRepo.create({ name: `Team ${i}` });
      await ttRepo.create({
        tournamentId: tournament.id,
        teamId: team.id,
        inscriptionOrder: i,
      });
    }

    const simulateSut = new SimulateTournamentUseCase(
      tournamentsRepo,
      ttRepo,
      matchesRepo,
      scoreGen
    );
    await simulateSut.execute({ tournamentId: tournament.id });

    const getResultSut = new GetTournamentResultUseCase(
      tournamentsRepo,
      matchesRepo
    );
    const result = await getResultSut.execute({ tournamentId: tournament.id });

    expect(result.tournamentId).toBe(tournament.id);
    expect(result.status).toBe('FINISHED');
    expect(result.matches).toHaveLength(8);
    expect(result.podium.first).toBeDefined();
    expect(result.podium.second).toBeDefined();
    expect(result.podium.third).toBeDefined();
  });
});
