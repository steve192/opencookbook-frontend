import {configureStore} from '@reduxjs/toolkit';
import {persistShopping} from '../helper/shopping/shoppingSync';
import authSlice from './features/authSlice';
import imagesSlice from './features/imagesSlice';
import recipesSlice from './features/recipesSlice';
import settingsSlice from './features/settingsSlice';
import shoppingSlice from './features/shoppingSlice';
import timersSlice from './features/timersSlice';
import weeklyRecipesSlice from './features/weeklyRecipesSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    settings: settingsSlice,
    weeklyRecipes: weeklyRecipesSlice,
    recipes: recipesSlice,
    images: imagesSlice,
    timers: timersSlice,
    shopping: shoppingSlice,
  },
});

persistShopping(store);


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
