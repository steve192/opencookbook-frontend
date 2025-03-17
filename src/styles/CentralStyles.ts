import {StyleSheet} from 'react-native';
import {MD3DarkTheme, MD3LightTheme, useTheme} from 'react-native-paper';

export const OwnPaperTheme = {
  ...MD3LightTheme,
  roundness: 10,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#72B600',
    accent: '#FFE102',
    success: '#00FF00',
    // background: '#FFFFFF',
    onPrimary: '#FFFFFF',
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
    // background: '#000000',
    onPrimary: '#FFFFFF',
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

