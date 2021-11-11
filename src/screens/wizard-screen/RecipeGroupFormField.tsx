import { Autocomplete, AutocompleteItem, Button, IndexPath, Input, Select, SelectItem } from "@ui-kitten/components";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Spacer from "react-spacer";
import { SelectionPopup } from "../../components/SelectionPopup";
import RestAPI, { Ingredient, IngredientUse, RecipeGroup } from "../../dao/RestAPI";


interface Props {
    recipeGroup: RecipeGroup
    onRecipeGroupChange: (newIngredient: RecipeGroup) => void
}

export const RecipeGroupFormField = (props: Props) => {

    const [availableGroups, setAvailableGroups] = useState<RecipeGroup[]>([]);

    const setRecipeGroup = (text: string) => {
        const existingGroup = availableGroups.find(group => group.title.toLowerCase() === text.toLowerCase());
        if (existingGroup) {
            props.onRecipeGroupChange(existingGroup);
        } else {
            props.onRecipeGroupChange({ title: text, type: "RecipeGroup" });
        }
    };


    const queryGroups = () => {
        RestAPI.getRecipeGroups()
            .then((groups) => {
                setAvailableGroups(groups);
            });
    }


    useEffect(queryGroups, []);

    const getGroupsAsStringlist = (groups: RecipeGroup[]) => {
        let stringList: string[] = [];
        groups.forEach(group => stringList.push(group.title));
        return stringList;
    }

    return (
        <>
            <SelectionPopup
                placeholder="Recipe group"
                value={props.recipeGroup.title}
                onValueChanged={setRecipeGroup}
                options={getGroupsAsStringlist(availableGroups)}
                allowAdditionalValues={true}
            />
        </>
    )
}