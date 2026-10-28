import axiosClient from './api/axiosClient'
import type { Project, ActivityLog, CommonListParams, ProjectProgress, ProjectMember } from '../types'

export interface ProjectQueryParams extends CommonListParams {
  status?: string
  priority?: string
}

export const projectService = {
  async getProjects(params?: ProjectQueryParams): Promise<Project[]> {
    try {
      let response
      try {
        response = await axiosClient.get<{ success?: boolean; data?: Project[]; projects?: Project[] }>(
          '/projects/list',
          { params }
        )
      } catch {
        response = await axiosClient.get<{ success?: boolean; data?: Project[]; projects?: Project[] }>(
          '/projects',
          { params }
        )
      }
      const list = response.data.projects || response.data.data || (Array.isArray(response.data) ? response.data : [])
      return list as Project[]
    } catch {
      return []
    }
  },

  async getProjectById(id: string): Promise<Project> {
    try {
      const response = await axiosClient.get<{ success?: boolean; data?: Project; project?: Project }>(
        `/projects/${id}`
      )
      return (response.data.project || response.data.data || response.data) as Project
    } catch {
      const projects = await this.getProjects()
      const found = projects.find((p) => p._id === id || p.id === id)
      if (!found) throw new Error('Project not found')
      return found
    }
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    try {
      const response = await axiosClient.post<{ success?: boolean; data?: Project; project?: Project }>(
        '/projects',
        data
      )
      return (response.data.project || response.data.data || response.data) as Project
    } catch {
      const newProject: Project = {
        _id: `prj_${Date.now()}`,
        name: data.name || 'Untitled Project',
        description: data.description || '',
        status: data.status || 'PLANNING',
        priority: data.priority || 'MEDIUM',
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        dueDate: data.dueDate,
        progress: 0,
        createdAt: new Date().toISOString(),
      }
      const existing = await this.getProjects()
      const updated = [newProject, ...existing]
      localStorage.setItem('saas_projects', JSON.stringify(updated))
      return newProject
    }
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    try {
      const response = await axiosClient.put<{ success?: boolean; data?: Project; project?: Project }>(
        `/projects/${id}`,
        data
      )
      return (response.data.project || response.data.data || response.data) as Project
    } catch {
      const existing = await this.getProjects()
      const updated = existing.map((p) => (p._id === id || p.id === id ? { ...p, ...data } : p))
      localStorage.setItem('saas_projects', JSON.stringify(updated))
      const found = updated.find((p) => p._id === id || p.id === id)
      if (!found) throw new Error('Project not found')
      return found
    }
  },

  async deleteProject(id: string): Promise<void> {
    try {
      await axiosClient.delete(`/projects/${id}`)
    } catch {
      const existing = await this.getProjects()
      const filtered = existing.filter((p) => p._id !== id && p.id !== id)
      localStorage.setItem('saas_projects', JSON.stringify(filtered))
    }
  },

  async getActivity(projectId?: string, params?: CommonListParams): Promise<ActivityLog[]> {
    try {
      const endpoint = projectId ? `/projects/${projectId}/activity` : '/activity'
      const response = await axiosClient.get<{ success?: boolean; data?: ActivityLog[]; activities?: ActivityLog[] }>(
        endpoint,
        { params }
      )
      const list = response.data.activities || response.data.data || (Array.isArray(response.data) ? response.data : [])
      return list as ActivityLog[]
    } catch {
      return []
    }
  },

  async getProjectProgress(id: string): Promise<ProjectProgress> {
    try {
      const response = await axiosClient.get<{ success?: boolean; data?: ProjectProgress; progress?: ProjectProgress }>(
        `/projects/${id}/progress`
      )
      return (response.data.progress || response.data.data || response.data) as ProjectProgress
    } catch {
      return { totalTasks: 0, completedTasks: 0, progressPercentage: 0 }
    }
  },

  async getProjectMembers(id: string): Promise<ProjectMember[]> {
    try {
      const response = await axiosClient.get<{ success?: boolean; data?: ProjectMember[]; members?: ProjectMember[] }>(
        `/projects/${id}/members`
      )
      const list = response.data.members || response.data.data || (Array.isArray(response.data) ? response.data : [])
      return list as ProjectMember[]
    } catch {
      return []
    }
  },

  async addProjectMember(id: string, userId: string, role: 'MANAGER' | 'MEMBER' = 'MEMBER'): Promise<ProjectMember> {
    const response = await axiosClient.post<{ success?: boolean; data?: ProjectMember; member?: ProjectMember }>(
      `/projects/${id}/members`,
      { userId, role }
    )
    return (response.data.member || response.data.data || response.data) as ProjectMember
  },

  async removeProjectMember(id: string, userId: string): Promise<void> {
    await axiosClient.delete(`/projects/${id}/members/${userId}`)
  },
}
