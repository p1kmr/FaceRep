module.exports = {
  preset: 'jest-expo',
  // Same aliases as tsconfig.json: '@/assets/*' is the assets folder, '@/*' is src.
  moduleNameMapper: {
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
