import { Button, Input, Spinner, Text } from '@ui-kitten/components';
import React, { useState } from 'react';
import { View } from 'react-native';
import Spacer from 'react-spacer';
import RestAPI from '../dao/RestAPI';
import CentralStyles from '../styles/CentralStyles';

interface Props {
    importUrl?: string
}
export const ImportScreen = (props: Props) => {

    const [importURL, setImportURL] = useState<string>("");
    const [importPending, setImportPending] = useState<boolean>(false);
    const [importError, setImportError] = useState<string>("");
    const [importSuccess, setImportSuccess] = useState<boolean>(false);

    const startImport = () => {
        setImportPending(true);
        setImportSuccess(false);
        RestAPI.importRecipe(importURL).then((importedRecipe) => {
            setImportPending(false);
            setImportError("");
            setImportSuccess(true);
        }).catch((error) => {
            setImportPending(false);
            setImportError(error.toString());
        });
    }
    return (
        <View style={CentralStyles.contentContainer}>
            <Text>URL to import</Text>
            <Input value={importURL} onChangeText={setImportURL} />
            <Spacer height={10} />
            <Button onPress={startImport}>Import</Button>
            <Spacer height={80} />
            <View>
                {!importPending ? null :
                    <Spinner size="giant" />
                }

                {!importError ? null :
                    <Text status="danger">Error while importing: {importError}</Text>
                }

                {!importSuccess ? null :
                    <Text status="success">Import successful</Text>
                }
            </View>
        </View>

    );
}