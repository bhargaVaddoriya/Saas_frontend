import axiosClient, { TOKEN_STORAGE_KEY, USER_STORAGE_KEY, ORG_STORAGE_KEY } from './api/axiosClient'
import type { User, AuthResponse } from '../types'

export interface LoginCredentials {
  email: string
  password?: string
}

export interface RegisterData {
  name: string
  email: string
  password?: string
  role?: 'OWNER' | 'ADMIN' | 'MEMBER'
  organizationName?: string
}

export const authService = {
  // Login user and persist token to localStorage
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosClient.post<{ success?: boolean; data?: AuthResponse } & AuthResponse>(
      '/auth/login',
      credentials
    )
    const payload = response.data.data || response.data
    if (payload.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, payload.token)
      const role = payload.user?.role || payload.organization?.role || payload.organizations?.[0]?.role || 'OWNER'
      payload.user = { ...payload.user, role }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload.user))

      const primaryOrgId = payload.organization?._id || payload.organization?.id || payload.organizations?.[0]?._id
      if (primaryOrgId) {
        localStorage.setItem(ORG_STORAGE_KEY, primaryOrgId)
      }
    }
    return payload
  },

  // Register user and persist token
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axiosClient.post<{ success?: boolean; data?: AuthResponse } & AuthResponse>(
      '/auth/register',
      data
    )
    const payload = response.data.data || response.data
    if (payload.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, payload.token)
      const role = payload.user?.role || payload.organization?.role || payload.organizations?.[0]?.role || 'OWNER'
      payload.user = { ...payload.user, role }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload.user))

      const primaryOrgId = payload.organization?._id || payload.organization?.id || payload.organizations?.[0]?._id
      if (primaryOrgId) {
        localStorage.setItem(ORG_STORAGE_KEY, primaryOrgId)
      }
    }
    return payload
  },

  // Logout user and clear tokens
  async logout(): Promise<void> {
    try {
      await axiosClient.post('/auth/logout')
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      localStorage.removeItem(USER_STORAGE_KEY)
      localStorage.removeItem(ORG_STORAGE_KEY)
    }
  },

  // Get current logged-in user profile
  async getCurrentUser(): Promise<User> {
    try {
      const response = await axiosClient.get<{ success?: boolean; data?: { user?: User; organization?: unknown } } & User>('/auth/me')
      const payload = response.data.data?.user || response.data.data || response.data
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload))
      return payload as User
    } catch (err) {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY)
      if (savedUser) {
        return JSON.parse(savedUser) as User
      }
      throw err
    }
  },

  // Verify invitation token
  async verifyInvite(token: string): Promise<{
    email: string
    role: string
    organization?: { id?: string; name: string; slug?: string } | null
    invitedBy?: { name: string } | null
    expiresAt: string
    isNewUser: boolean
    userName?: string
  }> {
    const response = await axiosClient.get<{
      success: boolean
      invitation: {
        email: string
        role: string
        organization?: { id?: string; name: string; slug?: string } | null
        invitedBy?: { name: string } | null
        expiresAt: string
        isNewUser: boolean
        userName?: string
      }
    }>(`/auth/verify-invite?token=${encodeURIComponent(token)}`)
    return response.data.invitation
  },

  // Accept invitation and set password
  async acceptInvite(data: { token: string; password?: string; name?: string }): Promise<AuthResponse> {
    const response = await axiosClient.post<{ success: boolean; data?: AuthResponse } & AuthResponse>(
      '/auth/accept-invite',
      data
    )
    const payload = response.data.data || response.data
    if (payload.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, payload.token)
      const role = payload.user?.role || payload.organization?.role || 'MEMBER'
      payload.user = { ...payload.user, role }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload.user))

      const primaryOrgId = payload.organization?._id || payload.organization?.id
      if (primaryOrgId) {
        localStorage.setItem(ORG_STORAGE_KEY, primaryOrgId)
      }
    }
    return payload
  },
}
