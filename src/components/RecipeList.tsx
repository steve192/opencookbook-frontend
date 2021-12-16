import { MaterialIcons } from "@expo/vector-icons";
import { Card, Layout, List, Text, useTheme } from "@ui-kitten/components";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ListRenderItemInfo, Pressable, StyleSheet, useWindowDimensions, View, ViewProps } from "react-native";
import { FolderIcon } from "../assets/Icons";
import { Recipe, RecipeGroup } from "../dao/RestAPI";
import { fetchMyRecipeGroups, fetchMyRecipes } from "../redux/features/recipesSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { RecipeImageComponent } from "./RecipeImageComponent";

interface Props {
    shownRecipeGroup: RecipeGroup | undefined
    onRecipeClick: (recipe: Recipe) => void
    onRecipeGroupClick: (recipeGroup: RecipeGroup) => void
}
export const RecipeList = (props: Props) => {
    const myRecipes = useAppSelector((state) => state.recipes.recipes);
    const myRecipeGroups = useAppSelector((state) => state.recipes.recipeGroups);
    const listRefreshing = useAppSelector((state) => state.recipes.loading);

    const { t } = useTranslation("translation");
    const theme = useTheme();

    const dispatch = useAppDispatch();


    const windowDimensions = useWindowDimensions();
    const numberOfColumns = Math.ceil(windowDimensions.width / 300);

    useEffect(refreshData, []);


    const createRecipeListItem = (recipe: Recipe) => {
        return (
            <Pressable
                style={[styles.recipeCard, { flex: 1 / numberOfColumns }]}
                onPress={() => props.onRecipeClick(recipe)}>
                <Layout style={{ height: 180 }}>
                    <RecipeImageComponent
                        forceFitScaling={true}
                        uuid={recipe.images.length > 0 ? recipe.images[0].uuid : undefined} />
                </Layout>
                {renderRecipeTitle(undefined, recipe.title)}
            </Pressable>
        );
    }
    const createRecipeGroupListItem = (recipeGroup: RecipeGroup) => {
        return (
            < Card
                style={[styles.recipeGroupCard, { flex: 1 / numberOfColumns }]}
                status='basic'
                onPress={() => props.onRecipeGroupClick(recipeGroup)}
                footer={headerProps => renderRecipeGroupTitle(headerProps, recipeGroup.title)}
                header={
                    <View>
                        <View style={{ flexDirection: "row", justifyContent: "center" }}>
                            <FolderIcon width={32} height={32} />
                        </View>
                    </View>}
            >
                <Layout style={{ height: 180 }}>

                </Layout>
            </Card >)
    }

    const renderItem = (info: ListRenderItemInfo<Recipe | RecipeGroup>): JSX.Element => {
        if (info.item.type === "Recipe") {
            return createRecipeListItem(info.item as Recipe);
        } else if (info.item.type === "RecipeGroup") {
            return createRecipeGroupListItem(info.item as RecipeGroup);
        }
        return <View></View>
    };

    const renderRecipeTitle = (headerProps: ViewProps | undefined, title: string) => (
        <Text numberOfLines={2} style={{ height: 60, padding: 10, fontWeight: "bold" }} >
            {title}
        </Text>
    );
    const renderRecipeGroupTitle = (headerProps: ViewProps | undefined, title: string) => (
        <View style={{ padding: 10, flexDirection: "row", alignItems: "center" }}>
            <Text numberOfLines={1} style={{ fontWeight: "bold" }} >
                {title}
            </Text>
        </View>
    );

    const renderNoItemsNotice = () => (
        <View style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center", flex: 1 }}>
            <MaterialIcons name="no-food" size={64} color={theme["text-disabled-color"]} />
            <Text category="h4" style={{ padding: 64, color: theme["text-disabled-color"] }}>
                {t("screens.overview.noRecipesMessage")}
            </Text>
        </View>
    );
    const getShownItems = (): (RecipeGroup | Recipe)[] => {
        if (!props.shownRecipeGroup) {
            return [...myRecipeGroups, ...myRecipes.filter(recipe => recipe.recipeGroups.length === 0)];
        } else {
            return myRecipes.filter(recipe => recipe.recipeGroups.filter(group => group.id === props.shownRecipeGroup?.id).length > 0);
        }
    }
    function refreshData() {
        dispatch(fetchMyRecipes());
        dispatch(fetchMyRecipeGroups());
    }

    return (
        getShownItems().length > 0 ?
            <List
                key={numberOfColumns} //To force re render when number of columns changes
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                data={getShownItems()}
                numColumns={numberOfColumns}
                renderItem={renderItem}
                refreshing={listRefreshing}
                onRefresh={refreshData}
            /> :
            renderNoItemsNotice()
    )

}

const styles = StyleSheet.create({
    container: {
        // maxHeight: 320,
        width: "100%"
    },
    contentContainer: {
        // paddingHorizontal: 8,
        // paddingVertical: 4,
    },
    recipeCard: {
        // marginVertical: 4,
        margin: 3,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "rgba(127,127,127, 0.05)" //TODO: Theme color

    },
    recipeGroupCard: {
        // marginVertical: 4,
        margin: 1,
        flex: 1
    },
    cardcontainer: {
        flex: 1,
        flexDirection: 'row',
    },
    containerImage: {
        flex: 1,
        width: undefined,
        height: 100,
    }
});

