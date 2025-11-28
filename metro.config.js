const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Custom resolver for web platform
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle mapbox CSS import on web
  if (platform === 'web' && moduleName === 'mapbox-gl/dist/mapbox-gl.css') {
    return {
      filePath: require.resolve('./src/assets/empty-module.js'),
      type: 'sourceFile',
    };
  }
  
  // Handle Mapbox maps import on web
  if (platform === 'web' && moduleName === '@rnmapbox/maps') {
    return {
      filePath: require.resolve('./src/components/WebMap.tsx'),
      type: 'sourceFile',
    };
  }
  
  // Handle Mapbox maps web module on web
  if (platform === 'web' && moduleName.includes('@rnmapbox/maps/lib/module/web')) {
    return {
      filePath: require.resolve('./src/components/WebMap.tsx'),
      type: 'sourceFile',
    };
  }
  
  // Handle react-native-maps on web
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      filePath: require.resolve('./src/components/WebMap.tsx'),
      type: 'sourceFile',
    };
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

// Add custom resolver for CSS files
config.resolver.assetExts.push('css');

// Remove the problematic buffer polyfill configuration
// The buffer module is already available through dependencies

module.exports = config;