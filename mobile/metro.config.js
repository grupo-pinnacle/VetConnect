const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// Equivalente a exclusionList de metro-config (0.83 ya no lo exporta).
function exclusionList(list) {
  return new RegExp(`(${list.map((r) => r.source).join('|')})$`);
}

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Monorepo: coexisten react-native 0.76.7 (root, stale SDK52), 0.81.4 (mobile,
// SDK54 canónica) y 0.87.1 (anidada bajo nativewind). Forzar copia única
// para evitar hooks duplicados y fuentes con sintaxis incompatible.
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

// Vetar copias duplicadas: RN 0.87.1 + React 19.3.0 anidados bajo nativewind y
// RN 0.76.7 stale del root (era SDK52). La única copia válida es la anidada
// en mobile (0.81.4 / React 19.1.0), alcanzable vía nodeModulesPaths.
config.resolver.blockList = exclusionList([
  /node_modules[/\\]nativewind[/\\]node_modules[/\\]react-native[/\\].*/,
  /node_modules[/\\]nativewind[/\\]node_modules[/\\]react[/\\].*/,
  /VetConnect[/\\]node_modules[/\\]react-native[/\\].*/,
]);

module.exports = withNativeWind(config, { input: './global.css' });
