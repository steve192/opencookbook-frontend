import {StyleSheet} from 'react-native';
import {MD3DarkTheme, MD3LightTheme, useTheme} from 'react-native-paper';

/**
 * Material 3 derives every container, tint and elevation colour from a tonal
 * palette. Paper ships the baseline purple one, and overriding only `primary`
 * left the rest of the app purple - container fills, surface tints and outlines
 * included. These are the tones of the brand green, so the whole palette below
 * is on brand from one place.
 */
const green = {
  tone0: '#000000',
  tone10: '#1e3300',
  tone20: '#324f00',
  tone30: '#456e00',
  tone40: '#598e00',
  tone60: '#8cce16',
  tone80: '#bce97a',
  tone90: '#dcf5b0',
  tone95: '#ecfad6',
  tone100: '#ffffff',
};

/** Desaturated green, for the quieter of the two brand roles. */
const sage = {
  tone10: '#131f0d',
  tone20: '#273420',
  tone30: '#3d4b32',
  tone40: '#55624c',
  tone80: '#bccbaf',
  tone90: '#d9e7ca',
  tone100: '#ffffff',
};

/** The warm accent that pairs with the green, tuned from the app accent yellow. */
const amber = {
  tone10: '#251a00',
  tone20: '#3a3000',
  tone30: '#544700',
  tone40: '#7a6a00',
  tone80: '#ddc74d',
  tone90: '#fbe98b',
  tone100: '#ffffff',
};

/** Neutrals carry a hint of the brand hue so surfaces sit next to it calmly. */
const neutral = {
  tone10: '#1a1d16',
  tone20: '#2f312a',
  tone30: '#44483d',
  tone50: '#74796b',
  tone60: '#8e9285',
  tone80: '#c4c8b9',
  tone90: '#e0e4d6',
  tone95: '#f1f2e9',
  tone99: '#fbfdf5',
};

const darkNeutral = {
  surface: '#12140e',
  elevation1: '#1b1f14',
  elevation2: '#1f2417',
  elevation3: '#232919',
  elevation4: '#252b1a',
  elevation5: '#292f1d',
};

export const OwnPaperTheme = {
  ...MD3LightTheme,
  roundness: 10,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#72B600',
    accent: '#FFE102',
    success: '#00FF00',
    onPrimary: '#FFFFFF',
    // `primary` is a light green built for filled buttons, where it carries white
    // text. As text or an icon directly on a surface it barely separates from the
    // background, so on-surface accents use this darker tone instead.
    primaryText: green.tone30,
    primaryContainer: green.tone90,
    onPrimaryContainer: green.tone10,
    secondary: sage.tone40,
    onSecondary: sage.tone100,
    secondaryContainer: sage.tone90,
    onSecondaryContainer: sage.tone10,
    tertiary: amber.tone40,
    onTertiary: amber.tone100,
    tertiaryContainer: amber.tone90,
    onTertiaryContainer: amber.tone10,
    background: neutral.tone99,
    onBackground: neutral.tone10,
    surface: neutral.tone99,
    onSurface: neutral.tone10,
    surfaceVariant: neutral.tone90,
    onSurfaceVariant: neutral.tone30,
    surfaceDisabled: 'rgba(26, 29, 22, 0.12)',
    onSurfaceDisabled: 'rgba(26, 29, 22, 0.38)',
    outline: neutral.tone50,
    outlineVariant: neutral.tone80,
    inverseSurface: neutral.tone20,
    inverseOnSurface: neutral.tone95,
    inversePrimary: green.tone80,
    elevation: {
      level0: 'transparent',
      level1: '#f4f8ea',
      level2: '#eff5e2',
      level3: '#eaf2da',
      level4: '#e8f1d7',
      level5: '#e5efd2',
    },
  },
};

export const OwnPaperThemeDark = {
  ...MD3DarkTheme,
  roundness: 10,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#518100',
    accent: '#C48600',
    success: '#00FF00',
    onPrimary: '#FFFFFF',
    primaryText: green.tone80,
    primaryContainer: '#3b5e00',
    onPrimaryContainer: green.tone90,
    secondary: sage.tone80,
    onSecondary: sage.tone20,
    secondaryContainer: sage.tone30,
    onSecondaryContainer: sage.tone90,
    tertiary: amber.tone80,
    onTertiary: amber.tone20,
    tertiaryContainer: amber.tone30,
    onTertiaryContainer: amber.tone90,
    background: darkNeutral.surface,
    onBackground: '#e2e3db',
    surface: darkNeutral.surface,
    onSurface: '#e2e3db',
    surfaceVariant: neutral.tone30,
    onSurfaceVariant: neutral.tone80,
    surfaceDisabled: 'rgba(226, 227, 219, 0.12)',
    onSurfaceDisabled: 'rgba(226, 227, 219, 0.38)',
    outline: neutral.tone60,
    outlineVariant: neutral.tone30,
    inverseSurface: '#e2e3db',
    inverseOnSurface: neutral.tone20,
    inversePrimary: green.tone40,
    elevation: {
      level0: 'transparent',
      level1: darkNeutral.elevation1,
      level2: darkNeutral.elevation2,
      level3: darkNeutral.elevation3,
      level4: darkNeutral.elevation4,
      level5: darkNeutral.elevation5,
    },
  },
};

export type AppTheme = typeof OwnPaperTheme;

export const useAppTheme = () => useTheme<AppTheme>();

export const OwnColors = {
  bluishGrey: '#8f9bb3',
};
export default StyleSheet.create({
  scrollView: {
    marginVertical: 10,
  },
  elementSpacing: {
    marginVertical: 10,
  },
  iconButton: {
    paddingHorizontal: 0,
    borderRadius: 16,
    width: 32,
    height: 32,
  },
  loginTitle: {
    paddingBottom: 20,
    fontWeight: 'bold',
    fontSize: 30,
    textAlign: 'center',
    color: 'white',
  },
  contentContainer: {
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    maxWidth: 800,
  },
  smallContentContainer: {
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    maxWidth: 500,
  },
  fullscreen: {width: '100%', height: '100%'},
});

export const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    width: '100%',
  },
  // Render this as a sibling placed *before* the popup content, never as its parent.
  // On native the deepest view wins the touch responder, so wrapping the content works
  // there, but on web the click bubbles up the dom and closes the popup as soon as
  // anything inside it is touched - the search field, for instance.
  modalBackdrop: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: 600,
    maxHeight: 800,
    flex: 1,
    marginBottom: 10,
    padding: 10,
    marginHorizontal: 10,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
