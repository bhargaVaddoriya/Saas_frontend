import axiosClient from './api/axiosClient'
import type { Task, Comment, TaskStatus, CommonListParams } from '../types'

export interface TaskQueryParams extends CommonListParams {
  projectId?: string
  status?: string
  priority?: string
  assigneeId?: string
}

export interface KanbanColumnsResponse {
  columns: {
    TODO: Task[]
    IN_PROGRESS: Task[]
    IN_REVIEW: Task[]
    COMPLETED: Task[]
  }
}

export const taskService = {
  async getTasks(params?: TaskQueryParams): Promise<Task[]> {
    try {
      const response = await axiosClient.get<{ success: boolean; data?: Task[]; tasks?: Task[] }>(
        '/tasks',
        { params: { limit: 100, ...params } }
      )
      return response.data.tasks || response.data.data || (Array.isArray(response.data) ? response.data : [])
    } catch {
      return []
    }
  },

  async getKanbanTasks(projectId?: string): Promise<KanbanColumnsResponse['columns']> {
    try {
      const response = await axiosClient.get<{ success: boolean; data?: KanbanColumnsResponse } & KanbanColumnsResponse>(
        '/tasks/kanban',
        { params: projectId ? { projectId } : undefined }
      )
      const data = response.data.data || response.data
      if (data.columns) return data.columns
      throw new Error('Fallback')
    } catch {
      const allTasks = await this.getTasks(projectId ? { projectId } : undefined)
      return {
        TODO: allTasks.filter((t) => t.status === 'TODO'),
        IN_PROGRESS: allTasks.filter((t) => t.status === 'IN_PROGRESS'),
        IN_REVIEW: allTasks.filter((t) => t.status === 'IN_REVIEW'),
        COMPLETED: allTasks.filter((t) => t.status === 'COMPLETED'),
      }
    }
  },

  async getTaskById(id: string): Promise<Task> {
    try {
      const response = await axiosClient.get<{ success: boolean; data?: Task; task?: Task } & Task>(`/tasks/${id}`)
      return (response.data as any).task || response.data.data || response.data
    } catch {
      const tasks = await this.getTasks()
      const found = tasks.find((t) => t._id === id || t.id === id)
      if (!found) throw new Error('Task not found')
      return found
    }
  },

  async createTask(data: Partial<Task>): Promise<Task> {
    try {
      const response = await axiosClient.post<{ success: boolean; data?: Task; task?: Task } & Task>('/tasks', data)
      return (response.data as any).task || response.data.data || response.data
    } catch {
      const newTask: Task = {
        _id: `tsk_${Date.now()}`,
        title: data.title || 'Untitled Task',
        description: data.description || '',
        projectId: data.projectId || 'prj_1',
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate,
        labels: data.labels || [],
        createdAt: new Date().toISOString(),
      }
      const existing = await this.getTasks()
      const updated = [newTask, ...existing]
      localStorage.setItem('saas_tasks', JSON.stringify(updated))
      return newTask
    }
  },

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    try {
      const response = await axiosClient.put<{ success: boolean; data?: Task; task?: Task } & Task>(`/tasks/${id}`, data)
      return (response.data as any).task || response.data.data || response.data
    } catch {
      const existing = await this.getTasks()
      const updated = existing.map((t) => (t._id === id || t.id === id ? { ...t, ...data } : t))
      localStorage.setItem('saas_tasks', JSON.stringify(updated))
      const found = updated.find((t) => t._id === id || t.id === id)
      if (!found) throw new Error('Task not found')
      return found
    }
  },

  async updateTaskStatus(id: string, status: TaskStatus, order?: number): Promise<Task> {
    try {
      const response = await axiosClient.patch<{ success: boolean; data?: Task; task?: Task } & Task>(`/tasks/${id}/status`, {
        status,
        order,
      })
      return (response.data as any).task || response.data.data || response.data
    } catch {
      return this.updateTask(id, { status })
    }
  },

  async updateTaskAssignee(id: string, assigneeId: string | null): Promise<Task> {
    try {
      const response = await axiosClient.patch<{ success: boolean; data?: Task; task?: Task } & Task>(`/tasks/${id}/assignee`, {
        assigneeId,
      })
      return (response.data as any).task || response.data.data || response.data
    } catch {
      return this.updateTask(id, { assigneeId: assigneeId || undefined })
    }
  },

  async deleteTask(id: string): Promise<void> {
    try {
      await axiosClient.delete(`/tasks/${id}`)
    } catch {
      const existing = await this.getTasks()
      const filtered = existing.filter((t) => t._id !== id && t.id !== id)
      localStorage.setItem('saas_tasks', JSON.stringify(filtered))
    }
  },

  async getComments(taskId: string): Promise<Comment[]> {
    try {
      const response = await axiosClient.get<{ success: boolean; data?: Comment[]; comments?: Comment[] } & Comment[]>(
        `/tasks/${taskId}/comments`
      )
      return (response.data as any).comments || response.data.data || response.data
    } catch {
      return []
    }
  },

  async addComment(taskId: string, content: string, mentions?: string[]): Promise<Comment> {
    try {
      const response = await axiosClient.post<{ success: boolean; data?: Comment; comment?: Comment } & Comment>(
        `/tasks/${taskId}/comments`,
        { content, mentions }
      )
      return (response.data as any).comment || response.data.data || response.data
    } catch {
      const savedUser = localStorage.getItem('user_info')
      const user = savedUser ? JSON.parse(savedUser) : { _id: 'usr_me', name: 'You' }
      return {
        _id: `cmt_${Date.now()}`,
        taskId,
        author: user,
        text: content,
        createdAt: new Date().toISOString(),
      }
    }
  },

  async deleteComment(commentId: string): Promise<void> {
    try {
      await axiosClient.delete(`/comments/${commentId}`)
    } catch {
      // Ignore fallback
    }
  },
}
