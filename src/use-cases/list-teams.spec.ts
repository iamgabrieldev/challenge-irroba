import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTeamsRepository } from '@/repositories/in-memory/in-memory-teams-repository';
import { ListTeamsUseCase } from './list-teams';

let teamsRepository: InMemoryTeamsRepository;
let sut: ListTeamsUseCase;

describe('ListTeams Use Case', () => {
  beforeEach(() => {
    teamsRepository = new InMemoryTeamsRepository();
    sut = new ListTeamsUseCase(teamsRepository);
  });

  it('should return empty array when no teams', async () => {
    const { teams } = await sut.execute();
    expect(teams).toEqual([]);
  });

  it('should return all teams', async () => {
    await teamsRepository.create({ name: 'Time A' });
    await teamsRepository.create({ name: 'Time B' });

    const { teams } = await sut.execute();
    expect(teams).toHaveLength(2);
    const names = teams.map((t) => t.name).sort();
    expect(names).toEqual(['Time A', 'Time B']);
  });
});
