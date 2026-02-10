const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Tell Metro to prefer browser/react-native exports from packages like jose
// This prevents jose from loading its Node.js build (which needs crypto, zlib, util)
config.resolver.unstable_conditionNames = [
  'react-native',
  'browser',
  'require',
  'import',
];

module.exports = withNativeWind(config, { input: './global.css' });
