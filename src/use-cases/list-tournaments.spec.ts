import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTournamentsRepository } from '@/repositories/in-memory/in-memory-tournaments-repository';
import { ListTournamentsUseCase } from './list-tournaments';

let tournamentsRepository: InMemoryTournamentsRepository;
let sut: ListTournamentsUseCase;

describe('ListTournaments Caso de Uso', () => {
  beforeEach(() => {
    tournamentsRepository = new InMemoryTournamentsRepository();
    sut = new ListTournamentsUseCase(tournamentsRepository);
  });

  it('deve retornar array vazio quando não houver torneios', async () => {
    const { tournaments } = await sut.execute();
    expect(tournaments).toEqual([]);
  });

  it('deve retornar todos os torneios', async () => {
    await tournamentsRepository.create({ name: 'Campeonato 1' });
    await tournamentsRepository.create({ name: 'Campeonato 2' });

    const { tournaments } = await sut.execute();
    expect(tournaments).toHaveLength(2);
    const names = tournaments.map((t) => t.name).sort();
    expect(names).toEqual(['Campeonato 1', 'Campeonato 2']);
  });
});
