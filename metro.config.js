// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname)

// react-native-collapsible-tab-view has no real web support (it declares
// Animated.createAnimatedComponent(...) at module scope, which crashes under
// Expo Router's Node-based static rendering) and pulls in
// react-native-pager-view, which has no web build at all. Neither is ever
// actually mounted on web — every caller branches on Platform.OS and renders
// a plain ScrollView/FlatList instead — so both are safe to swap for inert
// stubs when bundling for web. See shims/*.web.js for details.
const WEB_STUBS = {
  'react-native-pager-view': 'shims/react-native-pager-view.web.js',
  'react-native-collapsible-tab-view': 'shims/react-native-collapsible-tab-view.web.js',
};

config.resolver.resolveRequest = (context, moduleName, platform, ...rest) => {
  if (platform === 'web' && WEB_STUBS[moduleName]) {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, WEB_STUBS[moduleName]),
    };
  }
  return context.resolveRequest(context, moduleName, platform, ...rest);
};

module.exports = withNativeWind(config, { input: './global.css' })