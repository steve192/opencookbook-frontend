import React from 'react';
import { Button, Divider, Layout, Text } from '@ui-kitten/components';
import { StatusBar } from '../components/StatusBar';
import { View } from 'react-native';
import CentralStyles from '../styles/CentralStyles';
import { Picker } from '@react-native-picker/picker';
import Spacer from 'react-spacer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { changeTheme } from '../redux/features/settingsSlice';
import { ScrollView } from 'react-native-gesture-handler';

export const SettingsScreen = () => {

    const selectedTheme = useSelector((state: RootState) => state.settings.theme);
    const dispatch = useDispatch();
    return (
        <>
            <Layout style={[CentralStyles.contentContainer, CentralStyles.fullscreen]}>
                <ScrollView>
                    <Text category="label">Theme</Text>
                    <Picker
                        selectedValue={selectedTheme}
                        onValueChange={value => dispatch(changeTheme(value))}>
                        <Picker.Item label="Light" value="light" />
                        <Picker.Item label="Dark" value="dark" />
                    </Picker>
                    <Spacer height={20} />
                    <Divider />
                    <Spacer height={20} />
                    <View style={{ padding: 10, borderWidth: 1, borderRadius: 16, borderColor: "red" }}>
                        <Text category="label" status="danger">Danger zone</Text>
                        <Spacer height={20} />
                        <Button status="danger">Delete account</Button>
                    </View>
                </ScrollView>
            </Layout>
        </>
    )
}
