import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'

import js from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import _import from 'eslint-plugin-import'
import prettier from 'eslint-plugin-prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

const eslintConfig = [
  {
    /**
     * flat config 는 `node_modules` 만 기본으로 건너뛴다.
     * 빌드 산출물을 빼 두지 않으면 `eslint .` 이 `.next/` 안의 생성 코드까지 훑어
     * 몇 분씩 걸린다.
     */
    ignores: ['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts'],
  },

  // Next.js 기본 설정
  ...fixupConfigRules(compat.extends('next/core-web-vitals', 'next/typescript')),

  // TypeScript + Prettier + import
  ...fixupConfigRules(
    compat.extends(
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
      'plugin:import/typescript',
      'prettier',
    ),
  ),

  {
    plugins: {
      import: fixupPluginRules(_import),
      prettier: fixupPluginRules(prettier),
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-function': ['error'],
      '@typescript-eslint/no-require-imports': ['error', { allow: ['~/asset/*'] }],
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],
      '@typescript-eslint/no-unused-vars': 'warn',
      'import/no-named-as-default-member': 'off',
      'import/no-named-as-default': 'off',
      'import/export': 'error',
      'import/newline-after-import': ['error', { count: 1 }],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
          alphabetize: { order: 'asc' },
        },
      ],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'react/react-in-jsx-scope': 'off',
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-shadow': ['error'],
      'no-shadow': 'off',
      'no-undef': 'off',
    },
  },
]

export default eslintConfig
