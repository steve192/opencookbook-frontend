import {StyleSheet} from 'react-native';

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
