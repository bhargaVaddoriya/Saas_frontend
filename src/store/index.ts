import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import projectReducer from './slices/projectSlice'
import taskReducer from './slices/taskSlice'
import postReducer from './slices/postSlice'
import themeReducer from './slices/themeSlice'
import counterReducer from './slices/counterSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    tasks: taskReducer,
    posts: postReducer,
    theme: themeReducer,
    counter: counterReducer,
  },
  devTools: import.meta.env.DEV,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
