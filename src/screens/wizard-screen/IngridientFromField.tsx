import { Button, Input, useTheme } from "@ui-kitten/components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Spacer from "react-spacer";
import { DeleteIcon } from "../../assets/Icons";
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
    const [amount, setAmount] = useState<string>(String(props.ingredient.amount));

    const [availableUnits, setAvailableUnits] = useState<string[]>([]);

    const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);

    const theme = useTheme();
    const { t } = useTranslation("translation");

    const setIngredient = (text: string) => {
        setIngredientQuery(text);
        invokeIngredientUpdate(text, amount, unit);
    };

    const invokeIngredientUpdate = (ingredientName: string, amount: string, unit: string) => {
        const existingIngredient = availableIngredients.find(ingredient => ingredient.name.toLowerCase() === ingredientName.toLowerCase());
        if (existingIngredient) {
            props.onIngredientChange({ ingredient: existingIngredient, amount: parseFloat(amount), unit: unit });
        } else {
            props.onIngredientChange({ ingredient: { name: ingredientQuery }, amount: parseFloat(amount), unit: unit });
        }
    }


    const queryIngredients = () => {
        RestAPI.getIngredients(ingredientQuery)
            .then((ingredients) => {
                setAvailableIngredients(
                    ingredients
                    // ingredients.filter(item => item.name.toLowerCase().includes(ingredientQuery.toLowerCase()))
                );
            });
    }

    const onAmountChange = (text: string) => {
        text = text.replace(",", ".");
        setAmount(text);

        const prasedAmount = parseFloat(text);
        if (prasedAmount.toString() === text) {
            invokeIngredientUpdate(ingredientQuery, text, unit);
        }
    }


    useEffect(queryIngredients, [ingredientQuery]);
    useEffect(() => {
        RestAPI.getUnits().then((units) => {
            setAvailableUnits(units);
        });
    }, []);

    return (
        <>
            <View style={{ borderWidth: 1, borderColor: theme["background-basic-color-4"], padding: 10, borderRadius: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ flex: 1, flexDirection: "column" }}>
                        <View style={{ flex: 1, flexDirection: "row" }}>
                            <Input
                                style={{ width: 100 }}
                                value={(amount ? amount.toString() : "")}
                                placeholder={t("screens.editRecipe.amount")}
                                onChangeText={onAmountChange} />
                            <Spacer width={5} />
                            <SelectionPopup
                                value={unit}
                                options={availableUnits.map((unit, index) => ({ key: index.toString(), value: unit }))}
                                onValueChanged={selectedOption => setUnit(selectedOption.value)}
                                placeholder={t("screens.editRecipe.searchOrCreateUnit")}
                            />
                        </View>
                        <Spacer height={5} />
                        <View style={{ justifyContent: "center", flex: 1 }}>
                            <SelectionPopup
                                value={ingredientQuery}
                                options={availableIngredients.map(ingredient => ({ key: ingredient.id ? ingredient.id.toString() : "", value: ingredient.name }))}
                                onValueChanged={(selectedOption) => setIngredient(selectedOption.value)}
                                placeholder={t("screens.editRecipe.searchOrCreateIngredients")}
                                allowAdditionalValues={true}
                            />
                        </View>
                    </View>
                    <Button
                        style={{ height: 32, width: 32, margin: 10 }}
                        size="small"
                        status="control"
                        accessoryLeft={<DeleteIcon />}
                        onPress={() => props.onRemovePress()} />
                </View>
            </View>
        </>
    )
}