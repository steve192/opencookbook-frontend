import { Button, Input, InputProps, useTheme } from "@ui-kitten/components";
import React from "react";
import { View } from "react-native";
import { DeleteIcon } from "../../assets/Icons";


export const RecipeFormField = (inputProps: InputProps & { onRemovePress: Function }) => {
    const theme = useTheme();
    return (

        <View style={{ alignItems: "center", flexDirection: "row" , borderWidth: 1, borderColor: theme["background-basic-color-4"], padding: 10, borderRadius: 16 }}>
            <Input
                style={{flex: 1}}
                {...inputProps} />
            <Button
                style={{ height: 32, width: 32, margin: 10 }}
                size="small"
                status="control"
                accessoryLeft={<DeleteIcon />}
                onPress={() => inputProps.onRemovePress()} />

        </View>
    )
};