module.exports = {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: {
    '^@task-manager/auth$':
      '<rootDir>/../../libs/src/lib/auth/index.ts',
    '^@task-manager/models$':
      '<rootDir>/../../libs/src/lib/models/index.ts',
    '^@task-manager/data-access$':
      '<rootDir>/../../libs/src/lib/data-access/index.ts',
    '^@task-manager/tasks$':
      '<rootDir>/../../libs/src/lib/tasks/index.ts',
    '^@task-manager/users$':
      '<rootDir>/../../libs/src/lib/users/index.ts',
    '^@task-manager/analytics$':
      '<rootDir>/../../libs/src/lib/analytics/index.ts',
    '^@task-manager/utils$':
      '<rootDir>/../../libs/src/lib/utils/index.ts',
  },
  coverageDirectory: '../../coverage/apps/api',
  collectCoverageFrom: [
    'src/**/*.ts',
    '../../libs/src/lib/auth/**/*.ts',
    '../../libs/src/lib/tasks/**/*.ts',
    '../../libs/src/lib/analytics/**/*.ts',
    '../../libs/src/lib/users/**/*.ts',
    '../../libs/src/lib/data-access/**/*.ts',
    '!**/*.spec.ts',
    '!**/index.ts',
    '!**/*.module.ts',
    '!**/main.ts',
    '!**/dto/**',
    '!**/schemas/**',
  ],
  coverageThreshold: {
    global: {
      branches: 55,
      functions: 65,
      lines: 70,
      statements: 70,
    },
  },
  testTimeout: 120000,
  maxWorkers: 1,
};
