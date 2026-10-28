import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { authService, type LoginCredentials, type RegisterData } from '../../services/authService'
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../../services/api/axiosClient'
import type { User } from '../../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || null
}

const initialUser = getStoredUser()
const initialToken = getStoredToken()

const initialState: AuthState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  loading: false,
  error: null,
}

// Async Thunks
export const loginUser = createAsyncThunk<User, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      return response.user
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      return rejectWithValue(msg)
    }
  }
)

export const registerUser = createAsyncThunk<User, RegisterData, { rejectValue: string }>(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authService.register(data)
      return response.user
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      return rejectWithValue(msg)
    }
  }
)

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authService.logout()
})

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null
    },
    setAuthSession: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false
        state.user = action.payload
        state.token = localStorage.getItem(TOKEN_STORAGE_KEY)
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Invalid email or password'
      })

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false
        state.user = action.payload
        state.token = localStorage.getItem(TOKEN_STORAGE_KEY)
        state.isAuthenticated = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Registration failed'
      })

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
    })
  },
})

export const { clearAuthError, setAuthSession } = authSlice.actions
export default authSlice.reducer
