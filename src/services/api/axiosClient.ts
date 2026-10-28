import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

export const TOKEN_STORAGE_KEY = 'auth_token'
export const USER_STORAGE_KEY = 'user_info'
export const ORG_STORAGE_KEY = 'active_org_id'

// Base URL loaded from environment variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

export const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request Interceptor: Attach JWT Token & Active Org ID from LocalStorage
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    const orgId = localStorage.getItem(ORG_STORAGE_KEY)
    if (orgId && config.headers) {
      config.headers['x-organization-id'] = orgId
    }

    if (import.meta.env.DEV) {
      console.log(`[HTTP ${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`)
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Handle Responses and Centralized Errors
axiosClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    let message = 'An unexpected error occurred. Please try again.'

    if (error.response) {
      const status = error.response.status
      const data = error.response.data as { message?: string; error?: string }

      if (status === 401) {
        // Token expired or invalid
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        localStorage.removeItem(USER_STORAGE_KEY)

        // Only redirect if not already on public auth screens
        const currentPath = window.location.pathname
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login'
        }
        message = data.message || 'Session expired. Please log in again.'
      } else if (status === 403) {
        message = data.message || 'Access denied: You do not have permission for this action.'
      } else if (status === 404) {
        message = data.message || 'The requested resource was not found.'
      } else if (status === 422 || status === 400) {
        message = data.message || 'Invalid input or validation error.'
      } else if (status >= 500) {
        message = data.message || 'Server error. Please try again later.'
      } else {
        message = data.message || `Request failed with status ${status}`
      }
    } else if (error.request) {
      message = 'Network error: Cannot reach the backend server. Please verify the server is running.'
    }

    return Promise.reject(new Error(message))
  }
)

export default axiosClient
