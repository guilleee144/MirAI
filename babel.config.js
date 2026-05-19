module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
          reanimated: false,
        }
      ],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@/': './src/',
            '@features/': './src/features/',
            '@components/': './src/components/',
            '@services/': './src/services/',
            '@stores/': './src/stores/',
            '@hooks/': './src/hooks/',
            '@lib/': './src/lib/',
            '@types/': './src/types/',
            '@theme/': './src/theme/',
            '@constants/': './src/constants/',
            '@providers/': './src/providers/',
          },
        },
      ],
    ],
  }
}