import { Autocomplete, AutocompleteItem, Button, Divider, Input, InputProps } from "@ui-kitten/components";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Spacer from "react-spacer";
import RestAPI, { Ingredient, IngredientUse } from "../../dao/RestAPI";


interface Props {
    ingredient: IngredientUse
    onIngredientChange: (newIngredient: IngredientUse) => void
    onRemovePress: () => void
}

export const IngredientFormField = (props: Props) => {

    const [ingredientQuery, setIngredientQuery] = useState<string>(props.ingredient.ingredient.name);
    const [amountAndUnit, setAmountAndUnit] = useState<string>(props.ingredient.amount + " " + props.ingredient.unit);
    const [unit, setUnit] = useState<string>(props.ingredient.unit);
    const [amount, setAmount] = useState<number | undefined>(props.ingredient.amount);

    const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);

    const setIngredient = (text: string) => {
        setIngredientQuery(text);
        const existingIngredient = availableIngredients.find(ingredient => ingredient.name.toLowerCase() === ingredientQuery.toLowerCase());
        if (existingIngredient) {
            props.onIngredientChange({ ingredient: existingIngredient, amount: amount, unit: unit });
        } else {
            props.onIngredientChange({ ingredient: { name: text }, amount: amount, unit: unit });
        }
    };

    const renderIngredientOptions = (item: Ingredient, index: number) => (
        <AutocompleteItem
            key={index}
            title={item.name}
        />
    );

    const queryIngredients = () => {
        RestAPI.getIngredients(ingredientQuery)
            .then((ingredients) => {
                setAvailableIngredients(
                    ingredients.filter(item => item.name.toLowerCase().includes(ingredientQuery.toLowerCase()))
                );
            });
    }

    const onAmountUnitFieldChange = (text: string) => {
        const splitted = text.split(" ");
        if (splitted.length >= 2 && parseFloat(splitted[0])) {
            setAmount(parseFloat(splitted[0]));
            const [, ...unitPart] = splitted;
            setUnit(unitPart.join(""));
        } else if (parseFloat(text)) {
            setAmount(parseFloat(text));
            setUnit("");
        } else {
            setAmount(undefined);
            setUnit(text);
        }
    }

    const onAmountChange = (text: string) => {
        setAmount(parseFloat(text));
    }

    const onUnitChange = (text: string) => {
        setUnit(text);
    }

    useEffect(queryIngredients, [ingredientQuery]);

    return (
        <>
            <View style={{ flex: 1, flexDirection: "column" }}>
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <Input
                        style={{  width: 100 }}
                        value={(amount ? amount.toString() : "")}
                        placeholder="Amount"
                        onChangeText={onAmountChange} />
                        <Spacer width={5}/>
                    <Input
                        style={{ width: 150 }}
                        value={unit}
                        placeholder="Unit"
                        onChangeText={onUnitChange} />
                </View>
                <Spacer height={5}/>
                <View style={{ justifyContent: "center", flex: 1 }}>
                    <Autocomplete
                        placeholder='Ingredient'
                        value={ingredientQuery}
                        // accessoryRight={renderCloseIcon}
                        onChangeText={(text) => setIngredient(text)}
                        onSelect={(index) => setIngredient(availableIngredients[index].name)}>
                        {availableIngredients.map((ingredient, index) => renderIngredientOptions(ingredient, index))}
                    </Autocomplete>
                    <Button style={{ position: "absolute", right: 5 }} size="tiny" onPress={() => props.onRemovePress()}>X</Button>

                </View>
            </View>
            <Divider style={{ marginVertical: 10 }} />
        </>
    )
}