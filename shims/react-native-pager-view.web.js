// react-native-pager-view has no web build (its native component imports
// codegenNativeCommands, which Metro can't bundle for web) and nothing in
// this app renders it on web — every screen that uses
// react-native-collapsible-tab-view branches on Platform.OS before mounting
// its <Tabs.Container>. This stub keeps the web bundle buildable by standing
// in for the module wherever it's pulled in transitively.
import React from 'react';

const PagerView = React.forwardRef((props, ref) => null);
PagerView.displayName = 'PagerView';

export default PagerView;
