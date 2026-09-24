module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      // babel-preset-expo solo auto-agrega este plugin si resuelve `expo-router`
      // desde su propia ubicación (hoisted al root del monorepo, donde no existe).
      // Inclusión explícita: transforma require.context(process.env.EXPO_ROUTER_APP_ROOT).
      require('babel-preset-expo/build/expo-router-plugin').expoRouterBabelPlugin,
    ],
  };
};
