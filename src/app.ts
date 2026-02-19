import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { ZodError } from 'zod';
import { env } from '@/env';
import { teamsRoutes } from '@/http/controllers/teams/routes';
import { tournamentsRoutes } from '@/http/controllers/tournaments/routes';

export const app = Fastify({ logger: true });

app.register(cors);
app.register(swagger, {
  openapi: {
    info: {
      title: 'Meu Campeonato API',
      description: 'API para simulação de campeonato eliminatório (mata-mata)',
      version: '1.0.0',
    },
  },
});
app.register(swaggerUi, {
  routePrefix: '/docs',
});
app.get('/health', async () => ({ status: 'ok' }));
app.register(teamsRoutes, { prefix: '/teams' });
app.register(tournamentsRoutes, { prefix: '/tournaments' });

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error.',
      issues: error.format(),
    });
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error);
  }

  return reply.status(500).send({ message: 'Internal server error.' });
});
