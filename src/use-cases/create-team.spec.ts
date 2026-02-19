import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTeamsRepository } from '@/repositories/in-memory/in-memory-teams-repository';
import { CreateTeamUseCase } from './create-team';

let teamsRepository: InMemoryTeamsRepository;
let sut: CreateTeamUseCase;

describe('CreateTeam Use Case', () => {
  beforeEach(() => {
    teamsRepository = new InMemoryTeamsRepository();
    sut = new CreateTeamUseCase(teamsRepository);
  });

  it('should create a team', async () => {
    const { team } = await sut.execute({ name: 'Time A' });

    expect(team.id).toEqual(expect.any(String));
    expect(team.name).toBe('Time A');
  });

  it('should persist the team', async () => {
    const { team } = await sut.execute({ name: 'Time B' });

    const found = await teamsRepository.findById(team.id);
    expect(found).toEqual(team);
  });
});
