import type { Task, Project, DashboardMetrics } from '../types'

export const calculateDashboardMetrics = (tasks: Task[], projects: Project[]): DashboardMetrics => {
  const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length

  const tasksByStatus = {
    TODO: tasks.filter((t) => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    IN_REVIEW: tasks.filter((t) => t.status === 'IN_REVIEW').length,
    COMPLETED: tasks.filter((t) => t.status === 'COMPLETED').length,
  }

  const tasksByPriority = {
    LOW: tasks.filter((t) => t.priority === 'LOW').length,
    MEDIUM: tasks.filter((t) => t.priority === 'MEDIUM').length,
    HIGH: tasks.filter((t) => t.priority === 'HIGH').length,
    CRITICAL: tasks.filter((t) => t.priority === 'CRITICAL').length,
  }

  const now = new Date().toISOString()
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && t.dueDate < now && t.status !== 'COMPLETED'
  ).length

  return {
    totalProjects: projects.length,
    activeProjects,
    completedProjects,
    totalTasks: tasks.length,
    tasksByStatus,
    tasksByPriority,
    overdueTasks,
    myTasksCount: tasks.length,
  }
}
