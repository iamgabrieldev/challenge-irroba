import { describe, it, expect } from 'vitest';
import { InMemoryTeamsRepository } from '@/repositories/in-memory/in-memory-teams-repository';
import { InMemoryTournamentsRepository } from '@/repositories/in-memory/in-memory-tournaments-repository';
import { InMemoryTournamentTeamsRepository } from '@/repositories/in-memory/in-memory-tournament-teams-repository';
import { InMemoryTournamentMatchesRepository } from '@/repositories/in-memory/in-memory-tournament-matches-repository';
import { SimulateTournamentUseCase } from './simulate-tournament';
import { InvalidTeamsCountError } from './errors/invalid-teams-count-error';
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

describe('SimulateTournament Caso de Uso', () => {
  it('deve lançar TournamentNotFoundError quando o torneio não existir', async () => {
    const teamsRepo = new InMemoryTeamsRepository();
    const tournamentsRepo = new InMemoryTournamentsRepository();
    const ttRepo = new InMemoryTournamentTeamsRepository(teamsRepo);
    const matchesRepo = new InMemoryTournamentMatchesRepository(teamsRepo);
    const scoreGen = createMockScoreGenerator([[1, 0]]);

    const sut = new SimulateTournamentUseCase(
      tournamentsRepo,
      ttRepo,
      matchesRepo,
      scoreGen
    );

    await expect(
      sut.execute({ tournamentId: 'non-existent' })
    ).rejects.toBeInstanceOf(TournamentNotFoundError);
  });

  it('deve lançar InvalidTeamsCountError quando não houver 8 times', async () => {
    const teamsRepo = new InMemoryTeamsRepository();
    const tournamentsRepo = new InMemoryTournamentsRepository();
    const ttRepo = new InMemoryTournamentTeamsRepository(teamsRepo);
    const matchesRepo = new InMemoryTournamentMatchesRepository(teamsRepo);
    const scoreGen = createMockScoreGenerator([[1, 0]]);

    const tournament = await tournamentsRepo.create({});
    for (let i = 0; i < 4; i++) {
      const team = await teamsRepo.create({ name: `Team ${i}` });
      await ttRepo.create({
        tournamentId: tournament.id,
        teamId: team.id,
        inscriptionOrder: i,
      });
    }

    const sut = new SimulateTournamentUseCase(
      tournamentsRepo,
      ttRepo,
      matchesRepo,
      scoreGen
    );

    await expect(
      sut.execute({ tournamentId: tournament.id })
    ).rejects.toBeInstanceOf(InvalidTeamsCountError);
  });

  it('deve simular todo o torneio e retornar o campeão', async () => {
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
    const teamIds: string[] = [];
    for (let i = 0; i < 8; i++) {
      const team = await teamsRepo.create({ name: `Team ${i}` });
      teamIds.push(team.id);
      await ttRepo.create({
        tournamentId: tournament.id,
        teamId: team.id,
        inscriptionOrder: i,
      });
    }

    const sut = new SimulateTournamentUseCase(
      tournamentsRepo,
      ttRepo,
      matchesRepo,
      scoreGen
    );

    const { championId } = await sut.execute({ tournamentId: tournament.id });

    expect(championId).toBeDefined();
    expect(teamIds).toContain(championId);

    const matches = await matchesRepo.findManyByTournamentId(tournament.id);
    expect(matches).toHaveLength(8);

    const updated = await tournamentsRepo.findById(tournament.id);
    expect(updated?.status).toBe('FINISHED');
  });

  it('deve usar tiebreaker (pontuação/pênaltis/ordem) em empate no placar', async () => {
    const teamsRepo = new InMemoryTeamsRepository();
    const tournamentsRepo = new InMemoryTournamentsRepository();
    const ttRepo = new InMemoryTournamentTeamsRepository(teamsRepo);
    const matchesRepo = new InMemoryTournamentMatchesRepository(teamsRepo);
    // Empate 0-0 na primeira partida, pênaltis decidem (2 chamadas)
    const scoreGen = createMockScoreGenerator([
      [0, 0],
      [3, 2],
      [1, 0],
      [2, 1],
      [0, 1],
      [1, 2],
      [2, 0],
      [1, 2],
      [1, 0],
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

    const sut = new SimulateTournamentUseCase(
      tournamentsRepo,
      ttRepo,
      matchesRepo,
      scoreGen
    );

    const { championId } = await sut.execute({ tournamentId: tournament.id });

    expect(championId).toBeDefined();
    const matches = await matchesRepo.findManyByTournamentId(tournament.id);
    expect(matches).toHaveLength(8);
  });
});
