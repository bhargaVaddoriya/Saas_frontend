import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { AppRoutes } from './routes/AppRoutes'
import { useAppSelector } from './store/hooks'

const ThemeSynchronizer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeMode = useAppSelector((state) => state.theme.mode)

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [themeMode])

  return <>{children}</>
}

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeSynchronizer>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeSynchronizer>
    </Provider>
  )
}

export default App
