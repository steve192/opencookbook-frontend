import { configureStore } from '@reduxjs/toolkit'
import authSlice from './features/authSlice'
import recipesSlice from './features/recipesSlice'
import settingsSlice from './features/settingsSlice'
import weeklyRecipesSlice from './features/weeklyRecipesSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    settings: settingsSlice,
    weeklyRecipes: weeklyRecipesSlice,
    recipes: recipesSlice
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch