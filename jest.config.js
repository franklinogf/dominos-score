/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { configFile: './babel.config.js' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  collectCoverageFrom: [
    'lib/utils.ts',
    'stores/use-game.ts',
    'stores/use-score-modal.ts',
    'stores/use-add-player-dialog.ts',
    'db/actions/game.ts',
    'db/actions/round.ts',
    'db/actions/settings.ts',
    'db/querys/settings.ts',
    'db/querys/game.ts',
    'db/querys/player.ts',
    'db/querys/round.ts',
    'hooks/use-tournament-title.ts',
  ],
};
