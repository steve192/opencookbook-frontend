import { Button, Input, InputProps } from "@ui-kitten/components";
import React from "react";
import { View } from "react-native";


export const RecipeFormField =  (inputProps: InputProps & { onRemovePress: Function}) => (
    <View style={{ justifyContent: "center" }}>
        <Input
            {...inputProps} />
        <Button style={{ position: "absolute", right: 5 }} size="tiny" onPress={() => inputProps.onRemovePress()}>X</Button>

    </View>
);