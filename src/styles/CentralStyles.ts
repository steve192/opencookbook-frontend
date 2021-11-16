import { useTheme } from '@ui-kitten/components/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    scrollView: {
        marginVertical: 10
    },
    elementSpacing: {
        marginVertical: 10
    },
    iconButton: {
        paddingHorizontal: 0,
        borderRadius: 16,
        width: 32,
        height: 32
    },
    contentContainer: {
        width: "100%",
        alignSelf: "center",
        justifyContent: "center",
        paddingVertical: 24,
        paddingHorizontal: 16,
        maxWidth: 800
    },
    fullscreen: { width: "100%", height: "100%" }
});