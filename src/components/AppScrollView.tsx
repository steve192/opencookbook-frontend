import React, {forwardRef, useEffect} from 'react';
import {Platform, ScrollView, ScrollViewProps} from 'react-native';
import {useAppTheme} from '../styles/CentralStyles';

const STYLE_ID = 'app-scrollbars';

/**
 * The app's scrollbars on the web, in the theme's colours: thin, rounded and shown only where a view scrolls. Only for
 * a mouse or trackpad: on touch screens, in the browser as in the installed app, the browser's own indicator shows
 * while scrolling and fades, as in native apps. One stylesheet for every scroll view, rewritten when the theme changes.
 *
 * @param {string} thumb the thumb's colour
 * @param {string} hover the thumb's colour under the pointer
 */
const useScrollbarStyles = (thumb: string, hover: string) => {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    const css = `@media (hover: hover) and (pointer: fine) {
[data-app-scroll] { scrollbar-width: thin; scrollbar-color: ${thumb} transparent; }
[data-app-scroll]::-webkit-scrollbar { width: 10px; height: 10px; }
[data-app-scroll]::-webkit-scrollbar-track { background: transparent; }
[data-app-scroll]::-webkit-scrollbar-thumb { background: ${thumb}; border-radius: 8px; border: 3px solid transparent;
  background-clip: content-box; }
[data-app-scroll]::-webkit-scrollbar-thumb:hover { background: ${hover}; background-clip: content-box; }
}`;
    const existing = document.getElementById(STYLE_ID);
    const style = existing ?? Object.assign(document.createElement('style'), {id: STYLE_ID});
    if (style.textContent !== css) {
      style.textContent = css;
    }
    if (!existing) {
      document.head.appendChild(style);
    }
  }, [thumb, hover]);
};

// The scroll view every screen uses, so scrollbars are styled in one place. Native apps keep the platform's indicator.
export const AppScrollView = forwardRef<ScrollView, ScrollViewProps>((props, ref) => {
  const theme = useAppTheme();
  useScrollbarStyles(theme.colors.outlineVariant, theme.colors.outline);
  // dataSet is React Native Web's way to set data attributes; native ignores it.
  const web = {dataSet: {appScroll: ''}} as Partial<ScrollViewProps>;
  return <ScrollView ref={ref} indicatorStyle={theme.dark ? 'white' : 'black'} {...web} {...props} />;
});

AppScrollView.displayName = 'AppScrollView';
