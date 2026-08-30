import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    reporters: ['default', ['junit', {outputFile: 'test-results/junit.xml'}]],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'cobertura'],
      // Logic modules only. Mirrors sonar.coverage.exclusions: .tsx components
      // have no test harness, and styles/theme/navigation types carry no logic.
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/navigation/NavigationRoutes.ts',
        'src/styles/**',
        'src/i18n/config.ts',
        'src/redux/hooks.ts',
        'src/redux/store.ts',
      ],
      reportsDirectory: 'coverage',
    },
  },
});
