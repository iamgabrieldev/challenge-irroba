import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTeamsRepository } from '@/repositories/in-memory/in-memory-teams-repository';
import { ListTeamsUseCase } from './list-teams';

let teamsRepository: InMemoryTeamsRepository;
let sut: ListTeamsUseCase;

describe('ListTeams Caso de Uso', () => {
  beforeEach(() => {
    teamsRepository = new InMemoryTeamsRepository();
    sut = new ListTeamsUseCase(teamsRepository);
  });

  it('deve retornar array vazio quando não houver times', async () => {
    const { teams } = await sut.execute();
    expect(teams).toEqual([]);
  });

  it('deve retornar todos os times', async () => {
    await teamsRepository.create({ name: 'Time A' });
    await teamsRepository.create({ name: 'Time B' });

    const { teams } = await sut.execute();
    expect(teams).toHaveLength(2);
    const names = teams.map((t) => t.name).sort();
    expect(names).toEqual(['Time A', 'Time B']);
  });
});
