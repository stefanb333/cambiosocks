import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Ikonice iz Figme su mali statični SVG fajlovi; next/image za njih ne donosi korist.
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
      // Isti redosled importa svuda: node i paketi, pa @/ (src), pa relativni, abecedno.
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type'],
          pathGroups: [
            { pattern: '@/**', group: 'internal' },
            { pattern: '@payload-config', group: 'internal' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  {
    ignores: [
      '.next/',
      '.data/',
      'media/',
      'reference-shopify-theme/',
      'src/payload-types.ts',
      'src/payload-generated-schema.ts',
      'src/migrations/',
      // Fajlove u (payload) generiše Payload ("DO NOT MODIFY"), osim custom.scss koji ESLint ne čita.
      'src/app/(payload)/',
    ],
  },
]

export default eslintConfig
