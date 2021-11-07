import { Button, Input, Text } from '@ui-kitten/components';
import React from 'react';
import { View } from 'react-native';
import Spacer from 'react-spacer';
import CentralStyles from '../styles/CentralStyles';

interface Props {
    importUrl?: string
}
export const ImportScreen = (props: Props) => {


    return (
        <View style={CentralStyles.contentContainer}>
            <Text>URL to import</Text>
            <Input/>
            <Spacer height={10}/>
            <Button>Import</Button>
        </View>

    );
}