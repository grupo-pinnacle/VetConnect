const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');
const resolve = require('resolve');

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

// ADR-031: Monorepo React Singleton Pinning
// El frontend web (@vetconnect/web) utiliza React 18.3.1 (LTS) en la raíz,
// mientras que mobile utiliza Expo SDK 54 con React 19.1.0 y React Native 0.81.4.
// Forzamos copia única canónica para evitar dispatchers nulos ('useId' of null) y colisión de hooks.
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

// Excluir copias conflictivas: React y React Native de la raíz del monorepo
// y las copias anidadas bajo nativewind.
config.resolver.blockList = exclusionList([
  /node_modules[/\\]nativewind[/\\]node_modules[/\\]react-native[/\\].*/,
  /node_modules[/\\]nativewind[/\\]node_modules[/\\]react[/\\].*/,
  /node_modules[/\\]nativewind[/\\]node_modules[/\\]react-dom[/\\].*/,
  /VetConnect[/\\]node_modules[/\\]react-native[/\\].*/,
  /VetConnect[/\\]node_modules[/\\]react[/\\].*/,
  /VetConnect[/\\]node_modules[/\\]react-dom[/\\].*/,
]);

// Intercepción determinista en tiempo de resolución:
// Cualquier dependencia (incluso si está alojada en la raíz del monorepo)
// que solicite react, react-dom o react-native se resolverá estrictamente
// contra las copias de mobile/node_modules (React 19.1.0 / RN 0.81.4).
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'react' ||
    moduleName.startsWith('react/') ||
    moduleName === 'react-dom' ||
    moduleName.startsWith('react-dom/') ||
    moduleName === 'react-native' ||
    moduleName.startsWith('react-native/')
  ) {
    const resolvedPath = resolve.sync(moduleName, {
      basedir: projectRoot,
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    });
    return {
      filePath: resolvedPath,
      type: resolvedPath.endsWith('.json') ? 'asset' : 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });

