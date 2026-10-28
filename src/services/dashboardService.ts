import axiosClient from './api/axiosClient'

export interface DashboardAnalytics {
  projects: {
    total: number
    active: number
    completed: number
    planning: number
  }
  tasks: {
    total: number
    completed: number
    overdue: number
    assignedToMe: number
    byStatus: {
      TODO: number
      IN_PROGRESS: number
      IN_REVIEW: number
      COMPLETED: number
    }
    byPriority: {
      LOW: number
      MEDIUM: number
      HIGH: number
      CRITICAL: number
    }
  }
  recentProjects?: Array<{
    _id: string
    name: string
    status: string
    priority: string
    progress: number
  }>
  upcomingTasks?: Array<{
    _id: string
    title: string
    status: string
    priority: string
    dueDate: string
  }>
}

export const dashboardService = {
  async getAnalytics(organizationId?: string): Promise<DashboardAnalytics> {
    try {
      const response = await axiosClient.get<{ success: boolean; data?: { analytics: DashboardAnalytics }; analytics?: DashboardAnalytics }>(
        '/dashboard',
        { params: organizationId ? { organizationId } : undefined }
      )
      const data = response.data.data?.analytics || response.data.analytics
      if (!data) throw new Error('No analytics data')
      return data
    } catch {
      return {
        projects: { total: 0, active: 0, completed: 0, planning: 0 },
        tasks: {
          total: 0,
          completed: 0,
          overdue: 0,
          assignedToMe: 0,
          byStatus: { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, COMPLETED: 0 },
          byPriority: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
        },
      }
    }
  },
}
