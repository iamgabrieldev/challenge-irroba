import path from 'node:path';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['**/*.e2e.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/server.ts',
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
