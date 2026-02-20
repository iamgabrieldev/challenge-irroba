import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTeamsRepository } from '@/repositories/in-memory/in-memory-teams-repository';
import { InMemoryTournamentsRepository } from '@/repositories/in-memory/in-memory-tournaments-repository';
import { InMemoryTournamentTeamsRepository } from '@/repositories/in-memory/in-memory-tournament-teams-repository';
import { CreateTournamentWithTeamsUseCase } from './create-tournament-with-teams';
import { DuplicateTeamIdsError } from './errors/duplicate-team-ids-error';
import { InvalidTeamsCountError } from './errors/invalid-teams-count-error';

describe('CreateTournamentWithTeams Caso de Uso', () => {
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

  it('deve lançar InvalidTeamsCountError quando ter menos de 8 times no chaveamento', async () => {
    const teamIds = Array.from({ length: 4 }, () => 'uuid');
    for (let i = 0; i < 4; i++) {
      const team = await teamsRepository.create({ name: `Team ${i}` });
      teamIds[i] = team.id;
    }

    await expect(
      sut.execute({ teamIds: teamIds.slice(0, 4) })
    ).rejects.toBeInstanceOf(InvalidTeamsCountError);
  });

  it('deve lançar InvalidTeamsCountError quando houver mais de 8 times no chaveamento', async () => {
    const teamIds: string[] = [];
    for (let i = 0; i < 10; i++) {
      const team = await teamsRepository.create({ name: `Team ${i}` });
      teamIds.push(team.id);
    }

    await expect(sut.execute({ teamIds })).rejects.toBeInstanceOf(
      InvalidTeamsCountError
    );
  });

  it('deve lançar DuplicateTeamIdsError quando teamIds contiver duplicatas', async () => {
    const team = await teamsRepository.create({ name: 'Team A' });
    const teamIds = Array(8).fill(team.id);

    await expect(sut.execute({ teamIds })).rejects.toBeInstanceOf(
      DuplicateTeamIdsError
    );
  });

  it('deve lançar Error quando um time não existir', async () => {
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

  it('deve criar um torneio com 8 times com sucesso', async () => {
    const teamIds: string[] = [];
    for (let i = 0; i < 8; i++) {
      const team = await teamsRepository.create({ name: `Team ${i}` });
      teamIds.push(team.id);
    }

    const { tournament } = await sut.execute({ teamIds });

    expect(tournament.id).toBeDefined();
    expect(tournament.status).toBe('PENDING');
  });

  it('deve persistir os times do torneio com ordem de inscrição correta', async () => {
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
