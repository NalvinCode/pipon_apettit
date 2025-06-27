module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [
    'nativewind/babel',
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@/components': './src/components',
          '@/screens': './src/screens',
          '@/services': './src/services',
          '@/hooks': './src/hooks',
          '@/context': './src/context',
          '@/utils': './src/utils',
          '@/types': './src/types',
          '@/assets': './src/assets',
          '@/navigation': './src/navigation',
        },
      },
    ],
  ],
};