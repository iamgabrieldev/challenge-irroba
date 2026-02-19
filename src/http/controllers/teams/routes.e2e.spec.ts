import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { app } from '@/app';
import { truncateTables } from '@/test/truncate-tables';

describe('Teams E2E', () => {
  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
    await truncateTables();
  });

  it('deve criar um time (POST /teams)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/teams',
      payload: { name: 'Time Alpha' },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('id');
    expect(body.name).toBe('Time Alpha');
  });

  it('deve retornar 400 ao criar time sem nome', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/teams',
      payload: {},
    });

    expect(response.statusCode).toBe(400);
  });

  it('deve listar times (GET /teams)', async () => {
    await app.inject({
      method: 'POST',
      url: '/teams',
      payload: { name: 'Time A' },
    });
    await app.inject({
      method: 'POST',
      url: '/teams',
      payload: { name: 'Time B' },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/teams',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.teams).toHaveLength(2);
    expect(body.teams.map((t: { name: string }) => t.name)).toContain('Time A');
    expect(body.teams.map((t: { name: string }) => t.name)).toContain('Time B');
  });
});
