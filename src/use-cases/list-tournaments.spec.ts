import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTournamentsRepository } from '@/repositories/in-memory/in-memory-tournaments-repository';
import { ListTournamentsUseCase } from './list-tournaments';

let tournamentsRepository: InMemoryTournamentsRepository;
let sut: ListTournamentsUseCase;

describe('ListTournaments Use Case', () => {
  beforeEach(() => {
    tournamentsRepository = new InMemoryTournamentsRepository();
    sut = new ListTournamentsUseCase(tournamentsRepository);
  });

  it('should return empty array when no tournaments', async () => {
    const { tournaments } = await sut.execute();
    expect(tournaments).toEqual([]);
  });

  it('should return all tournaments', async () => {
    await tournamentsRepository.create({ name: 'Campeonato 1' });
    await tournamentsRepository.create({ name: 'Campeonato 2' });

    const { tournaments } = await sut.execute();
    expect(tournaments).toHaveLength(2);
    const names = tournaments.map((t) => t.name).sort();
    expect(names).toEqual(['Campeonato 1', 'Campeonato 2']);
  });
});
