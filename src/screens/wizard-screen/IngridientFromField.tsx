import { Autocomplete, AutocompleteItem, Button, IndexPath, Input, Select, SelectItem } from "@ui-kitten/components";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Spacer from "react-spacer";
import { SelectionPopup } from "../../components/SelectionPopup";
import RestAPI, { Ingredient, IngredientUse } from "../../dao/RestAPI";


interface Props {
    ingredient: IngredientUse
    onIngredientChange: (newIngredient: IngredientUse) => void
    onRemovePress: () => void
}

export const IngredientFormField = (props: Props) => {

    const [ingredientQuery, setIngredientQuery] = useState<string>(props.ingredient.ingredient.name);
    const [unit, setUnit] = useState<string>(props.ingredient.unit);
    const [amount, setAmount] = useState<number | undefined>(props.ingredient.amount);

    const [availableUnits, setAvailableUnits] = useState<string[]>([]);

    const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
    const [selectedUnitIndex, setSelectedUnitIndex] = useState<IndexPath>();

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

    const onAmountChange = (text: string) => {
        setAmount(parseFloat(text));
    }


    useEffect(queryIngredients, [ingredientQuery]);
    useEffect(() => {
        RestAPI.getUnits().then((units) => {
            setAvailableUnits(units);
        });
    }, []);

    return (
        <>
            <View style={{ flex: 1, flexDirection: "column" }}>
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <Input
                        style={{ width: 100 }}
                        value={(amount ? amount.toString() : "")}
                        placeholder="Amount"
                        onChangeText={onAmountChange} />
                    <Spacer width={5} />
                    <SelectionPopup
                        value={unit}
                        options={availableUnits}
                        onValueChanged={setUnit}
                        placeholder="Unit"
                    />
                </View>
                <Spacer height={5} />
                <View style={{ justifyContent: "center", flex: 1 }}>
                    <SelectionPopup
                        value={ingredientQuery}
                        options={availableIngredients.map(ingredient => ingredient.name)}
                        onValueChanged={setIngredient}
                        placeholder="Ingredient"
                        allowAdditionalValues={true}
                    />
                    {/* <Autocomplete
                        placeholder='Ingredient'
                        value={ingredientQuery}
                        // accessoryRight={renderCloseIcon}
                        onChangeText={(text) => setIngredient(text)}
                        onSelect={(index) => setIngredient(availableIngredients[index].name)}>
                        {availableIngredients.map((ingredient, index) => renderIngredientOptions(ingredient, index))} */}
                    {/* </Autocomplete> */}
                    <Button style={{ position: "absolute", right: 5 }} size="tiny" onPress={() => props.onRemovePress()}>X</Button>

                </View>
            </View>
        </>
    )
}