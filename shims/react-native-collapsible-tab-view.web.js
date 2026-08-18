// react-native-collapsible-tab-view declares Animated.createAnimatedComponent(...)
// at module scope, which react-native-reanimated can't evaluate safely under
// Expo Router's Node-based static web rendering (expo-router/node/render.js) —
// it throws "Cannot access '<var>' before initialization" during SSR.
//
// Nothing in this app actually mounts <Tabs.Container> (or calls its hooks) on
// web: every screen that imports this library branches on Platform.OS first
// and renders a plain ScrollView/FlatList/FlashList instead. So on web we swap
// in this inert stand-in — its exports only need to exist, never to work.
import React from 'react';
import { View } from 'react-native';

const passthrough = (props) => React.createElement(View, null, props.children);

export const Tabs = {
  Container: passthrough,
  Tab: passthrough,
  ScrollView: passthrough,
  FlatList: passthrough,
  FlashList: passthrough,
};

export function useFocusedTab() {
  return undefined;
}

export function useHeaderMeasurements() {
  return { top: 0, height: 0 };
}

export function useCurrentTabScrollY() {
  return { value: 0 };
}

export function useCollapsibleStyle() {
  return { style: {}, contentContainerStyle: {}, progressViewOffset: 0 };
}
