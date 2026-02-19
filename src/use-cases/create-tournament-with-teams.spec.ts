import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTeamsRepository } from '@/repositories/in-memory/in-memory-teams-repository';
import { InMemoryTournamentsRepository } from '@/repositories/in-memory/in-memory-tournaments-repository';
import { InMemoryTournamentTeamsRepository } from '@/repositories/in-memory/in-memory-tournament-teams-repository';
import { CreateTournamentWithTeamsUseCase } from './create-tournament-with-teams';
import { InvalidTeamsCountError } from './errors/invalid-teams-count-error';

describe('CreateTournamentWithTeams Use Case', () => {
  let teamsRepository: InMemoryTeamsRepository;
  let tournamentsRepository: InMemoryTournamentsRepository;
  let tournamentTeamsRepository: InMemoryTournamentTeamsRepository;
  let sut: CreateTournamentWithTeamsUseCase;

  beforeEach(() => {
    teamsRepository = new InMemoryTeamsRepository();
    tournamentsRepository = new InMemoryTournamentsRepository();
    tournamentTeamsRepository = new InMemoryTournamentTeamsRepository(
      teamsRepository
    );
    sut = new CreateTournamentWithTeamsUseCase(
      tournamentsRepository,
      tournamentTeamsRepository,
      teamsRepository
    );
  });

  it('should throw InvalidTeamsCountError when less than 8 teams', async () => {
    const teamIds = Array.from({ length: 4 }, () => 'uuid');
    for (let i = 0; i < 4; i++) {
      const team = await teamsRepository.create({ name: `Team ${i}` });
      teamIds[i] = team.id;
    }

    await expect(
      sut.execute({ teamIds: teamIds.slice(0, 4) })
    ).rejects.toBeInstanceOf(InvalidTeamsCountError);
  });

  it('should throw InvalidTeamsCountError when more than 8 teams', async () => {
    const teamIds: string[] = [];
    for (let i = 0; i < 10; i++) {
      const team = await teamsRepository.create({ name: `Team ${i}` });
      teamIds.push(team.id);
    }

    await expect(sut.execute({ teamIds })).rejects.toBeInstanceOf(
      InvalidTeamsCountError
    );
  });

  it('should throw Error when a team does not exist', async () => {
    const teamIds: string[] = [];
    for (let i = 0; i < 7; i++) {
      const team = await teamsRepository.create({ name: `Team ${i}` });
      teamIds.push(team.id);
    }
    teamIds.push('00000000-0000-0000-0000-000000000000');

    await expect(sut.execute({ teamIds })).rejects.toThrow(
      'Team 00000000-0000-0000-0000-000000000000 not found'
    );
  });

  it('should create tournament with 8 teams successfully', async () => {
    const teamIds: string[] = [];
    for (let i = 0; i < 8; i++) {
      const team = await teamsRepository.create({ name: `Team ${i}` });
      teamIds.push(team.id);
    }

    const { tournament } = await sut.execute({ teamIds });

    expect(tournament.id).toBeDefined();
    expect(tournament.status).toBe('PENDING');
  });

  it('should persist tournament teams with correct inscription order', async () => {
    const teamIds: string[] = [];
    for (let i = 0; i < 8; i++) {
      const team = await teamsRepository.create({ name: `Team ${i}` });
      teamIds.push(team.id);
    }

    const { tournament } = await sut.execute({ teamIds });

    const ttList = await tournamentTeamsRepository.findManyByTournamentId(
      tournament.id
    );
    expect(ttList).toHaveLength(8);
    ttList.forEach((tt, i) => {
      expect(tt.inscriptionOrder).toBe(i);
      expect(tt.teamId).toBe(teamIds[i]);
    });
  });
});
