import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CreateTeamUseCase } from '@/use-cases/create-team';
import { ListTeamsUseCase } from '@/use-cases/list-teams';
import { PrismaTeamsRepository } from '@/repositories/prisma/prisma-teams-repository';

export async function teamsRoutes(app: FastifyInstance) {
  const teamsRepository = new PrismaTeamsRepository();
  const createTeamUseCase = new CreateTeamUseCase(teamsRepository);
  const listTeamsUseCase = new ListTeamsUseCase(teamsRepository);

  app.post('/', {
    schema: {
      tags: ['Teams'],
      summary: 'Criar time',
      body: {
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string', minLength: 1 } },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const createTeamBodySchema = z.object({
      name: z.string().min(1),
    });
    const { name } = createTeamBodySchema.parse(request.body);
    const { team } = await createTeamUseCase.execute({ name });
    return reply.status(201).send(team);
  });

  app.get('/', {
    schema: {
      tags: ['Teams'],
      summary: 'Listar times',
      response: {
        200: {
          type: 'object',
          properties: {
            teams: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  name: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
  }, async () => {
    const { teams } = await listTeamsUseCase.execute();
    return { teams };
  });
}
