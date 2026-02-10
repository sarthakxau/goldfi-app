const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Tell Metro to prefer browser/react-native exports from packages like jose, @noble/hashes
// 'default' is needed as fallback for packages that use it in their exports map
config.resolver.unstable_conditionNames = [
  'react-native',
  'browser',
  'require',
  'import',
  'default',
];

module.exports = withNativeWind(config, { input: './global.css' });
