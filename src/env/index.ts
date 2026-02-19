import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z
    .string()
    .url()
    .default('postgresql://campeonato:campeonato123@localhost:5432/meu_campeonato'),
});

export const env = envSchema.parse(process.env);
