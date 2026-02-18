import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/main.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/*.config.*',
        '**/docs/**',
        '**/*.md',
        '**/prisma/**',
        '**/.eslintrc*',
        '**/.prettierrc*',
      ],
      // Meta: 90% (plan.md). Ajustar para 90 quando os testes de domínio forem implementados.
      thresholds: {
        branches: 0,
        functions: 0,
        lines: 0,
        statements: 0,
      },
    },
  },
});
