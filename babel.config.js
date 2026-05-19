module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // Path aliases — must match tsconfig.json paths
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@features': './src/features',
            '@components': './src/components',
            '@services': './src/services',
            '@stores': './src/stores',
            '@hooks': './src/hooks',
            '@lib': './src/lib',
            '@types': './src/types',
            '@theme': './src/theme',
            '@constants': './src/constants',
            '@providers': './src/providers',
          },
        },
      ],
      // Reanimated must be last
      'react-native-reanimated/plugin',
    ],
  }
}
