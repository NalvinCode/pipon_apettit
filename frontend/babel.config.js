module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", {
        "unstable_transformImportMeta": true
      }]
    ],
    plugins: [
      'nativewind/babel',
      [
        'babel-plugin-module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/config': './src/config',
            '@/types': './src/types',
            '@/services': './src/services',
            '@/context': './src/context',
            '@/hooks': './src/hooks',
            '@/utils': './src/utils',
            '@/constants': './src/constants',
          },
        },
      ],
    ],
  };
};