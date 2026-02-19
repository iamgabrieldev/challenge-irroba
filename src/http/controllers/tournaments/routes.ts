import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CreateTournamentWithTeamsUseCase } from '@/use-cases/create-tournament-with-teams';
import { SimulateTournamentUseCase } from '@/use-cases/simulate-tournament';
import { GetTournamentResultUseCase } from '@/use-cases/get-tournament-result';
import { ListTournamentsUseCase } from '@/use-cases/list-tournaments';
import { PrismaTeamsRepository } from '@/repositories/prisma/prisma-teams-repository';
import { PrismaTournamentsRepository } from '@/repositories/prisma/prisma-tournaments-repository';
import { PrismaTournamentTeamsRepository } from '@/repositories/prisma/prisma-tournament-teams-repository';
import { PrismaTournamentMatchesRepository } from '@/repositories/prisma/prisma-tournament-matches-repository';
import { PythonScoreGenerator } from '@/lib/python-score-generator';
import { InvalidTeamsCountError } from '@/use-cases/errors/invalid-teams-count-error';
import { TournamentNotFoundError } from '@/use-cases/errors/tournament-not-found-error';

export async function tournamentsRoutes(app: FastifyInstance) {
  const teamsRepository = new PrismaTeamsRepository();
  const tournamentsRepository = new PrismaTournamentsRepository();
  const tournamentTeamsRepository = new PrismaTournamentTeamsRepository();
  const tournamentMatchesRepository = new PrismaTournamentMatchesRepository();
  const scoreGenerator = new PythonScoreGenerator();

  const createTournamentWithTeamsUseCase = new CreateTournamentWithTeamsUseCase(
    tournamentsRepository,
    tournamentTeamsRepository,
    teamsRepository
  );
  const simulateTournamentUseCase = new SimulateTournamentUseCase(
    tournamentsRepository,
    tournamentTeamsRepository,
    tournamentMatchesRepository,
    scoreGenerator
  );
  const getTournamentResultUseCase = new GetTournamentResultUseCase(
    tournamentsRepository,
    tournamentMatchesRepository
  );
  const listTournamentsUseCase = new ListTournamentsUseCase(
    tournamentsRepository
  );

  const teamIdsBodySchema = {
    type: 'object',
    required: ['teamIds'],
    properties: {
      teamIds: {
        type: 'array',
        items: { type: 'string', format: 'uuid' },
        minItems: 8,
        maxItems: 8,
      },
    },
  };

  const matchSchema = {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      phase: { type: 'string' },
      matchOrder: { type: 'number' },
      homeTeam: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } },
      awayTeam: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } },
      homeScore: { type: ['number', 'null'] },
      awayScore: { type: ['number', 'null'] },
      winner: { type: ['object', 'null'], properties: { id: { type: 'string' }, name: { type: 'string' } } },
    },
  };

  const podiumSchema = {
    type: 'object',
    properties: {
      first: { type: ['object', 'null'], properties: { id: { type: 'string' }, name: { type: 'string' } } },
      second: { type: ['object', 'null'], properties: { id: { type: 'string' }, name: { type: 'string' } } },
      third: { type: ['object', 'null'], properties: { id: { type: 'string' }, name: { type: 'string' } } },
    },
  };

  app.post('/simulate', {
    schema: {
      tags: ['Tournaments'],
      summary: 'Criar torneio e simular',
      body: teamIdsBodySchema,
      response: {
        201: {
          type: 'object',
          properties: {
            tournamentId: { type: 'string' },
            status: { type: 'string' },
            matches: { type: 'array', items: matchSchema },
            podium: podiumSchema,
          },
        },
      },
    },
  }, async (request, reply) => {
    const bodySchema = z.object({
      teamIds: z.array(z.string().uuid()).length(8),
    });
    const { teamIds } = bodySchema.parse(request.body);
    const { tournament } = await createTournamentWithTeamsUseCase.execute({
      teamIds,
    });
    await simulateTournamentUseCase.execute({
      tournamentId: tournament.id,
    });
    const fullResult = await getTournamentResultUseCase.execute({
      tournamentId: tournament.id,
    });
    return reply.status(201).send(fullResult);
  });

  app.post('/', {
    schema: {
      tags: ['Tournaments'],
      summary: 'Criar torneio',
      body: teamIdsBodySchema,
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: ['string', 'null'] },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const createTournamentBodySchema = z.object({
      teamIds: z.array(z.string().uuid()).length(8),
    });
    const { teamIds } = createTournamentBodySchema.parse(request.body);
    const { tournament } = await createTournamentWithTeamsUseCase.execute({
      teamIds,
    });
    return reply.status(201).send(tournament);
  });

  app.post('/:tournamentId/simulate', {
    schema: {
      tags: ['Tournaments'],
      summary: 'Simular torneio existente',
      params: {
        type: 'object',
        properties: { tournamentId: { type: 'string', format: 'uuid' } },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            tournamentId: { type: 'string' },
            championId: { type: 'string' },
          },
        },
        404: { type: 'object', properties: { message: { type: 'string' } } },
        400: { type: 'object', properties: { message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const paramsSchema = z.object({
      tournamentId: z.string().uuid(),
    });
    const { tournamentId } = paramsSchema.parse(request.params);
    try {
      const result = await simulateTournamentUseCase.execute({ tournamentId });
      return reply.status(200).send(result);
    } catch (error) {
      if (error instanceof TournamentNotFoundError) {
        return reply.status(404).send({ message: error.message });
      }
      if (error instanceof InvalidTeamsCountError) {
        return reply.status(400).send({ message: error.message });
      }
      throw error;
    }
  });

  app.get('/', {
    schema: {
      tags: ['Tournaments'],
      summary: 'Listar torneios',
      response: {
        200: {
          type: 'object',
          properties: {
            tournaments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  name: { type: ['string', 'null'] },
                  status: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
  }, async () => {
    const { tournaments } = await listTournamentsUseCase.execute();
    return { tournaments };
  });

  app.get('/:tournamentId', {
    schema: {
      tags: ['Tournaments'],
      summary: 'Obter resultado do torneio',
      params: {
        type: 'object',
        properties: { tournamentId: { type: 'string', format: 'uuid' } },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            tournamentId: { type: 'string' },
            status: { type: 'string' },
            matches: { type: 'array', items: matchSchema },
            podium: podiumSchema,
          },
        },
        404: { type: 'object', properties: { message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const paramsSchema = z.object({
      tournamentId: z.string().uuid(),
    });
    const { tournamentId } = paramsSchema.parse(request.params);
    try {
      const result = await getTournamentResultUseCase.execute({ tournamentId });
      return result;
    } catch (error) {
      if (error instanceof TournamentNotFoundError) {
        return reply.status(404).send({ message: error.message });
      }
      throw error;
    }
  });
}
