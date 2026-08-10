import ts from 'typescript-eslint';

export default ts.config(
  ...ts.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**', 'tests/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-require-imports': 'off',
      'prefer-const': 'warn',
    }
  }
);
