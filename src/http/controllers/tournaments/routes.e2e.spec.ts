import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { app } from '@/app';
import { truncateTables } from '@/test/truncate-tables';

describe('Tournaments E2E', () => {
  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
    await truncateTables();
  });

  async function createEightTeams(): Promise<string[]> {
    const names = [
      'Time 1',
      'Time 2',
      'Time 3',
      'Time 4',
      'Time 5',
      'Time 6',
      'Time 7',
      'Time 8',
    ];
    const ids: string[] = [];
    for (const name of names) {
      const res = await app.inject({
        method: 'POST',
        url: '/teams',
        payload: { name },
      });
      const body = JSON.parse(res.body);
      ids.push(body.id);
    }
    return ids;
  }

  it('deve criar torneio, simular e retornar resultado (POST /tournaments/simulate)', async () => {
    const teamIds = await createEightTeams();

    const response = await app.inject({
      method: 'POST',
      url: '/tournaments/simulate',
      payload: { teamIds },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('matches');
    expect(body).toHaveProperty('podium');
    expect(body.podium).toHaveProperty('first');
    expect(body.podium).toHaveProperty('second');
    expect(body.podium).toHaveProperty('third');
    expect(body.matches.length).toBeGreaterThan(0);
  });

  it('deve retornar resultado de torneio (GET /tournaments/:id)', async () => {
    const teamIds = await createEightTeams();
    const createRes = await app.inject({
      method: 'POST',
      url: '/tournaments/simulate',
      payload: { teamIds },
    });
    const createBody = JSON.parse(createRes.body);
    const tournamentId = createBody.tournamentId;
    expect(tournamentId).toBeDefined();

    const response = await app.inject({
      method: 'GET',
      url: `/tournaments/${tournamentId}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('matches');
    expect(body).toHaveProperty('podium');
  });

  it('deve retornar 404 para torneio inexistente', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const response = await app.inject({
      method: 'GET',
      url: `/tournaments/${fakeId}`,
    });

    expect(response.statusCode).toBe(404);
  });

  it('deve listar torneios (GET /tournaments)', async () => {
    const teamIds = await createEightTeams();
    await app.inject({
      method: 'POST',
      url: '/tournaments/simulate',
      payload: { teamIds },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/tournaments',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.tournaments).toHaveLength(1);
  });
});
