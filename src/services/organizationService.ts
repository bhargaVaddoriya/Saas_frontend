import axiosClient from './api/axiosClient'
import type { Organization, OrganizationMember, UserRole } from '../types'

export const organizationService = {
  async getOrganizations(): Promise<Organization[]> {
    try {
      const response = await axiosClient.get<{ success?: boolean; data?: Organization[]; organizations?: Organization[] }>(
        '/organizations'
      )
      const list = response.data.organizations || response.data.data || (Array.isArray(response.data) ? response.data : [])
      return list as Organization[]
    } catch {
      return []
    }
  },

  async getOrganization(): Promise<Organization | null> {
    try {
      const orgs = await this.getOrganizations()
      return orgs[0] || null
    } catch {
      return null
    }
  },

  async getOrganizationByIdOrSlug(idOrSlug: string): Promise<Organization> {
    const response = await axiosClient.get<{ success?: boolean; data?: Organization; organization?: Organization }>(
      `/organizations/${idOrSlug}`
    )
    const org = response.data.organization || response.data.data || response.data
    return org as Organization
  },

  async createOrganization(data: { name: string; description?: string; slug?: string }): Promise<Organization> {
    const response = await axiosClient.post<{ success?: boolean; data?: Organization; organization?: Organization }>(
      '/organizations',
      data
    )
    return (response.data.organization || response.data.data || response.data) as Organization
  },

  async updateOrganization(idOrSlug: string, data: Partial<Organization>): Promise<Organization> {
    const response = await axiosClient.put<{ success?: boolean; data?: Organization; organization?: Organization }>(
      `/organizations/${idOrSlug}`,
      data
    )
    return (response.data.organization || response.data.data || response.data) as Organization
  },

  async getMembers(orgId: string): Promise<OrganizationMember[]> {
    try {
      const response = await axiosClient.get<{ success?: boolean; data?: OrganizationMember[]; members?: OrganizationMember[] }>(
        `/organizations/${orgId}/members`
      )
      return (response.data.members || response.data.data || []) as OrganizationMember[]
    } catch {
      return []
    }
  },

  async addMember(orgId: string, member: { email: string; role?: UserRole }): Promise<{ success: boolean; message?: string; invitation?: any }> {
    const response = await axiosClient.post<{ success: boolean; message?: string; invitation?: any }>(
      `/organizations/${orgId}/members`,
      member
    )
    return response.data
  },

  async updateMemberRole(orgId: string, userId: string, role: UserRole): Promise<void> {
    await axiosClient.patch(`/organizations/${orgId}/members/${userId}`, { role })
  },

  async removeMember(orgId: string, userId: string): Promise<Organization> {
    const response = await axiosClient.delete<{ success?: boolean; data?: Organization; organization?: Organization }>(
      `/organizations/${orgId}/members/${userId}`
    )
    return (response.data.organization || response.data.data || response.data) as Organization
  },
}
