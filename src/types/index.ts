export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export interface Post {
  id: number
  title: string
  body: string
  userId?: number
}

export interface User {
  _id: string
  id?: string
  name: string
  email: string
  role: UserRole
  organizationId?: string
  organizationName?: string
  avatar?: string
  organization?: Organization
  organizations?: Organization[]
  createdAt?: string
}

export interface OrganizationMember {
  userId: string
  user?: User
  role: UserRole
  joinedAt?: string
}

export interface Organization {
  _id: string
  id?: string
  name: string
  slug?: string
  description?: string
  role?: UserRole
  owner: string | User
  members: OrganizationMember[]
  createdAt?: string
  updatedAt?: string
}

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED'
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Project {
  _id: string
  id?: string
  name: string
  description?: string
  status: ProjectStatus
  priority: ProjectPriority
  startDate?: string
  dueDate?: string
  owner?: string | User
  members?: (string | User)[]
  organizationId?: string
  progress?: number
  createdAt?: string
  updatedAt?: string
}

export interface ProjectProgress {
  totalTasks: number
  completedTasks: number
  progressPercentage: number
  byStatus?: Record<TaskStatus, number>
}

export interface ProjectMember {
  _id?: string
  userId: string | User
  user?: User
  role: 'MANAGER' | 'MEMBER'
  joinedAt?: string
}

export interface ProjectDetailsResponse extends Project {
  myProjectRole?: 'MANAGER' | 'MEMBER' | 'OWNER'
  totalTasks?: number
  completedTasks?: number
  progressPercentage?: number
  memberCount?: number
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Task {
  _id: string
  id?: string
  title: string
  description?: string
  projectId: string
  project?: Project | string
  assignee?: User | null
  assigneeId?: string
  reporter?: User
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  labels?: string[]
  order?: number
  createdAt?: string
  updatedAt?: string
}

export interface Comment {
  _id: string
  id?: string
  taskId: string
  author: User
  text: string
  content?: string
  mentions?: string[]
  createdAt: string
  updatedAt?: string
}

export interface ActivityLog {
  _id: string
  id?: string
  user: User
  action: string
  entityType: 'PROJECT' | 'TASK' | 'MEMBER' | 'COMMENT'
  entityTitle: string
  projectId?: string
  createdAt: string
}

export interface DashboardMetrics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalTasks: number
  tasksByStatus: Record<TaskStatus, number>
  tasksByPriority: Record<TaskPriority, number>
  overdueTasks: number
  myTasksCount: number
}

export interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface CommonListParams {
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
  search?: string
  organizationId?: string
}

export interface AuthResponse {
  token: string
  user: User
  organization?: Organization
  organizations?: Organization[]
}

export type ThemeMode = 'dark' | 'light'
