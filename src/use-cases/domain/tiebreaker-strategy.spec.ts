import { describe, it, expect } from 'vitest';
import {
  PontuacaoStrategy,
  OrdemInscricaoStrategy,
  PenaltyStrategy,
  type TiebreakerContext,
} from './tiebreaker-strategy';

function createContext(overrides: Partial<TiebreakerContext>): TiebreakerContext {
  const scores = new Map<string, number>();
  return {
    scores,
    teams: [
      { id: 'team-1', inscriptionOrder: 0 },
      { id: 'team-2', inscriptionOrder: 1 },
    ],
    homeId: 'team-1',
    awayId: 'team-2',
    homeScore: 0,
    awayScore: 0,
    ...overrides,
  };
}

describe('PontuacaoStrategy', () => {
  it('deve retornar home quando tem mais pontos', async () => {
    const context = createContext({});
    context.scores.set('team-1', 2);
    context.scores.set('team-2', 0);

    const strategy = new PontuacaoStrategy();
    const winner = await strategy.resolve(context);

    expect(winner).toBe('team-1');
  });

  it('deve retornar away quando tem mais pontos', async () => {
    const context = createContext({});
    context.scores.set('team-1', -1);
    context.scores.set('team-2', 1);

    const strategy = new PontuacaoStrategy();
    const winner = await strategy.resolve(context);

    expect(winner).toBe('team-2');
  });

  it('deve retornar null quando pontuação é igual', async () => {
    const context = createContext({});
    context.scores.set('team-1', 0);
    context.scores.set('team-2', 0);

    const strategy = new PontuacaoStrategy();
    const winner = await strategy.resolve(context);

    expect(winner).toBeNull();
  });
});

describe('OrdemInscricaoStrategy', () => {
  it('deve retornar home quando tem ordem menor', async () => {
    const context = createContext({});

    const strategy = new OrdemInscricaoStrategy();
    const winner = await strategy.resolve(context);

    expect(winner).toBe('team-1');
  });

  it('deve retornar away quando tem ordem menor', async () => {
    const context = createContext({
      teams: [
        { id: 'team-1', inscriptionOrder: 1 },
        { id: 'team-2', inscriptionOrder: 0 },
      ],
      homeId: 'team-1',
      awayId: 'team-2',
    });

    const strategy = new OrdemInscricaoStrategy();
    const winner = await strategy.resolve(context);

    expect(winner).toBe('team-2');
  });
});

describe('PenaltyStrategy', () => {
  it('deve retornar home quando pênaltis do home são maiores', async () => {
    const context = createContext({});
    const scoreGen = { async generate(): Promise<[number, number]> { return [5, 3]; } };

    const strategy = new PenaltyStrategy(scoreGen);
    const winner = await strategy.resolve(context);

    expect(winner).toBe('team-1');
  });

  it('deve retornar away quando pênaltis do away são maiores', async () => {
    const context = createContext({});
    const scoreGen = { async generate(): Promise<[number, number]> { return [2, 4]; } };

    const strategy = new PenaltyStrategy(scoreGen);
    const winner = await strategy.resolve(context);

    expect(winner).toBe('team-2');
  });

  it('deve retornar null em empate nos pênaltis', async () => {
    const context = createContext({});
    const scoreGen = { async generate(): Promise<[number, number]> { return [3, 3]; } };

    const strategy = new PenaltyStrategy(scoreGen);
    const winner = await strategy.resolve(context);

    expect(winner).toBeNull();
  });
});
