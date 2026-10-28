import axiosClient from './api/axiosClient'

export interface AppNotification {
  _id: string
  title: string
  message: string
  type?: 'TASK_ASSIGNED' | 'STATUS_CHANGED' | 'MENTION' | 'DUE_DATE'
  read: boolean
  createdAt: string
  link?: string
}

export interface NotificationResponse {
  unreadCount: number
  notifications: AppNotification[]
}

export const notificationService = {
  async getNotifications(): Promise<NotificationResponse> {
    try {
      const response = await axiosClient.get<{ success: boolean; data?: NotificationResponse } & NotificationResponse>(
        '/notifications'
      )
      const data = response.data.data || response.data
      return {
        unreadCount: data.unreadCount || 0,
        notifications: data.notifications || [],
      }
    } catch {
      return {
        unreadCount: 0,
        notifications: [],
      }
    }
  },

  async markAsRead(id: string): Promise<void> {
    try {
      await axiosClient.patch(`/notifications/${id}/read`)
    } catch {
      // Ignore fallback
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await axiosClient.patch('/notifications/read-all')
    } catch {
      // Ignore fallback
    }
  },
}
