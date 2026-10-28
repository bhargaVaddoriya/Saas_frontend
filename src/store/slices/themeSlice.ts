import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ThemeMode } from '../../types'

interface ThemeState {
  mode: ThemeMode
}

const getInitialTheme = (): ThemeMode => {
  const saved = localStorage.getItem('app_theme') as ThemeMode
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const initialState: ThemeState = {
  mode: getInitialTheme(),
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark'
      localStorage.setItem('app_theme', state.mode)
      if (state.mode === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload
      localStorage.setItem('app_theme', state.mode)
      if (state.mode === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer
