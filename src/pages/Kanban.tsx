import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Send,
  Trash2,
  Calendar,
  FolderKanban,
  ExternalLink,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  updateTaskStatus,
  moveTaskOptimistic,
  createTask,
  setTaskSearch,
  fetchTasks,
} from '../store/slices/taskSlice'
import { fetchProjects } from '../store/slices/projectSlice'
import { taskService } from '../services/taskService'
import { organizationService } from '../services/organizationService'
import type { Task, TaskStatus, TaskPriority, Comment, OrganizationMember } from '../types'
import {
  Button,
  Card,
  Input,
  Badge,
  Modal,
  Alert,
} from '../components/common'

export const Kanban: React.FC = () => {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeProjectId = searchParams.get('projectId') || ''

  const { user } = useAppSelector((state) => state.auth)
  const { tasks, filter } = useAppSelector((state) => state.tasks)
  const { projects } = useAppSelector((state) => state.projects)

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [taskComments, setTaskComments] = useState<Comment[]>([])
  const [commentInput, setCommentInput] = useState('')
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([])

  // Create Task Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState<TaskPriority>('MEDIUM')
  const [newStatus, setNewStatus] = useState<TaskStatus>('TODO')
  const [newProjectId, setNewProjectId] = useState(activeProjectId)
  const [newAssigneeId, setNewAssigneeId] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newLabels, setNewLabels] = useState('')

  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'TODO', label: 'To Do', color: 'border-t-slate-400 text-slate-700 dark:text-slate-300' },
    { status: 'IN_PROGRESS', label: 'In Progress', color: 'border-t-indigo-500 text-indigo-600 dark:text-indigo-400' },
    { status: 'IN_REVIEW', label: 'In Review', color: 'border-t-amber-500 text-amber-600 dark:text-amber-400' },
    { status: 'COMPLETED', label: 'Completed', color: 'border-t-emerald-500 text-emerald-600 dark:text-emerald-400' },
  ]

  useEffect(() => {
    dispatch(fetchProjects())

    // Fetch org members for task assignee options
    organizationService.getOrganization().then((org) => {
      if (org?._id) {
        organizationService.getMembers(org._id).then((m) => setOrgMembers(m))
      }
    })
  }, [dispatch])

  // Fetch tasks whenever activeProjectId changes (or on initial load)
  useEffect(() => {
    dispatch(fetchTasks(activeProjectId ? { projectId: activeProjectId } : undefined))
  }, [dispatch, activeProjectId])

  useEffect(() => {
    if (activeProjectId) {
      setNewProjectId(activeProjectId)
    } else if (projects.length > 0) {
      setNewProjectId(projects[0]._id || projects[0].id || '')
    }
  }, [activeProjectId, projects])

  // Fetch comments when selectedTask changes
  useEffect(() => {
    if (selectedTask?._id) {
      setIsCommentsLoading(true)
      taskService
        .getComments(selectedTask._id)
        .then((data) => setTaskComments(data))
        .catch(() => setTaskComments([]))
        .finally(() => setIsCommentsLoading(false))
    } else {
      setTaskComments([])
    }
  }, [selectedTask?._id])

  const handleStatusChange = (taskId: string, targetStatus: TaskStatus) => {
    dispatch(moveTaskOptimistic({ id: taskId, status: targetStatus }))
    dispatch(updateTaskStatus({ id: taskId, status: targetStatus }))
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const labelsArray = newLabels
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean)

    await dispatch(
      createTask({
        title: newTitle,
        description: newDescription,
        priority: newPriority,
        status: newStatus,
        projectId: newProjectId || projects[0]?._id || 'prj_1',
        assigneeId: newAssigneeId || undefined,
        dueDate: newDueDate || undefined,
        labels: labelsArray.length > 0 ? labelsArray : ['Sprint'],
      })
    )

    setNewTitle('')
    setNewDescription('')
    setNewDueDate('')
    setNewLabels('')
    setIsCreateOpen(false)
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentInput.trim() || !selectedTask?._id) return

    // Extract @mentions if any (e.g., @user)
    const mentionRegex = /@(\w+)/g
    const mentions: string[] = []
    let match
    while ((match = mentionRegex.exec(commentInput)) !== null) {
      mentions.push(match[1])
    }

    const newCmt = await taskService.addComment(selectedTask._id, commentInput, mentions)
    setTaskComments((prev) => [...prev, newCmt])
    setCommentInput('')
  }

  const handleDeleteComment = async (commentId: string) => {
    await taskService.deleteComment(commentId)
    setTaskComments((prev) => prev.filter((c) => c._id !== commentId && c.id !== commentId))
  }

  const handleAssigneeChange = async (taskId: string, assigneeId: string) => {
    const updated = await taskService.updateTaskAssignee(taskId, assigneeId || null)
    if (selectedTask?._id === taskId) {
      setSelectedTask(updated)
    }
    dispatch(fetchTasks(activeProjectId ? { projectId: activeProjectId } : undefined))
  }

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to archive this task?')) {
      await taskService.deleteTask(taskId)
      setSelectedTask(null)
      dispatch(fetchTasks(activeProjectId ? { projectId: activeProjectId } : undefined))
    }
  }

  // Helper to safely extract project ID whether populated as an object or stored as a string
  const getTaskProjectId = (task: any): string => {
    if (!task) return ''
    const p = task.projectId ?? task.project
    if (!p) return ''
    if (typeof p === 'string') return p
    if (typeof p === 'object') {
      return p._id ? String(p._id) : p.id ? String(p.id) : ''
    }
    return String(p)
  }

  // Filter tasks by active project and search query
  const filteredTasks = tasks.filter((t) => {
    if (!t) return false
    const taskProjId = getTaskProjectId(t)
    const matchesProject = activeProjectId
      ? String(taskProjId) === String(activeProjectId)
      : true
    const query = (filter?.search || '').toLowerCase().trim()
    if (!query) return matchesProject
    const title = (t.title || '').toLowerCase()
    const description = (t.description || '').toLowerCase()
    return matchesProject && (title.includes(query) || description.includes(query))
  })

  const currentProjectName =
    projects.find((p) => String(p._id || p.id) === String(activeProjectId))?.name ||
    'All Projects'

  return (
    <div className="space-y-6">
      {/* Kanban Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Project Kanban Board
            </h1>
            <Badge variant="primary">{currentProjectName}</Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Drag, transition, and monitor task workflow states in real-time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Project Switcher Filter */}
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-slate-400" />
            <select
              value={activeProjectId}
              onChange={(e) => {
                const val = e.target.value
                if (val) {
                  setSearchParams({ projectId: val })
                } else {
                  setSearchParams({})
                }
              }}
              className="rounded-xl border border-slate-200 bg-white/80 p-2 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900 shadow-xs"
            >
              <option value="">All Workspace Projects</option>
              {projects.map((p, idx) => (
                <option key={p._id || p.id || `proj_${idx}`} value={p._id || p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Task
          </Button>
        </div>
      </div>

      {projects.length === 0 && (
        <Alert
          type="info"
          title="No Project Active"
          message="To organize tasks on the board, please create your first project under the Projects section."
        />
      )}

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          placeholder="Search board tasks by title or criteria..."
          value={filter.search}
          onChange={(e) => dispatch(setTaskSearch(e.target.value))}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.status)
          return (
            <div
              key={col.status}
              className={`rounded-2xl border-t-4 border border-slate-200/80 bg-slate-100/60 p-4 dark:border-slate-800/80 dark:bg-slate-900/40 min-h-[550px] flex flex-col justify-between ${col.color}`}
            >
              <div>
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold">{col.label}</h3>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="space-y-3">
                  {colTasks.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                      No tasks in {col.label}
                    </div>
                  ) : (
                    colTasks.map((task, idx) => (
                      <Card
                        key={task._id || task.id || `task_${idx}`}
                        hoverEffect
                        onClick={() => setSelectedTask(task)}
                        className="p-4 cursor-pointer border-slate-200/90 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 transition-all hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={
                              task.priority === 'CRITICAL' || task.priority === 'HIGH'
                                ? 'danger'
                                : task.priority === 'MEDIUM'
                                ? 'warning'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {task.priority}
                          </Badge>

                          {task.dueDate && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Labels */}
                        {task.labels && task.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.labels.map((lbl) => (
                              <span
                                key={lbl}
                                className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                              >
                                {lbl}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Card Footer: Assignee & Column Transitions */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                              {task.assignee?.name?.[0] || 'U'}
                            </div>
                            <span className="text-[11px] truncate max-w-[80px]">
                              {task.assignee?.name || 'Unassigned'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Step Left */}
                            {col.status !== 'TODO' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const prevMap: Record<TaskStatus, TaskStatus> = {
                                    TODO: 'TODO',
                                    IN_PROGRESS: 'TODO',
                                    IN_REVIEW: 'IN_PROGRESS',
                                    COMPLETED: 'IN_REVIEW',
                                  }
                                  handleStatusChange(task._id, prevMap[task.status])
                                }}
                                title="Move Left"
                                className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Step Right */}
                            {col.status !== 'COMPLETED' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const nextMap: Record<TaskStatus, TaskStatus> = {
                                    TODO: 'IN_PROGRESS',
                                    IN_PROGRESS: 'IN_REVIEW',
                                    IN_REVIEW: 'COMPLETED',
                                    COMPLETED: 'COMPLETED',
                                  }
                                  handleStatusChange(task._id, nextMap[task.status])
                                }}
                                title="Move Right"
                                className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Add at column bottom */}
              <button
                type="button"
                onClick={() => {
                  setNewStatus(col.status)
                  setIsCreateOpen(true)
                }}
                className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Card</span>
              </button>
            </div>
          )
        })}
      </div>

      {/* Task Details Modal + Comments & Mentions */}
      {selectedTask && (
        <Modal
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          title={selectedTask.title}
        >
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="primary">{selectedTask.status}</Badge>
                <Badge variant="warning">{selectedTask.priority} Priority</Badge>
              </div>

              <div className="flex items-center gap-2">
                {selectedTask.projectId && (
                  <Link
                    to={`/projects/${selectedTask.projectId}`}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    View Project
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteTask(selectedTask._id)}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Archive
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Description
              </h5>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {selectedTask.description || 'No detailed description provided.'}
              </p>
            </div>

            {/* Assignee & Due Date Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Assignee
                </label>
                <select
                  value={selectedTask.assignee?._id || selectedTask.assigneeId || ''}
                  onChange={(e) => handleAssigneeChange(selectedTask._id, e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/80 p-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="">Unassigned</option>
                  {orgMembers.map((m, idx) => {
                    const uId = m.user?._id || m.user?.id || m.userId || (m as any).id || (m as any)._id || `assignee_m_${idx}`
                    const uName = m.user?.name || m.user?.email || uId
                    return (
                      <option key={uId} value={uId}>
                        {uName} ({m.role})
                      </option>
                    )
                  })}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Target Due Date
                </label>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  {selectedTask.dueDate
                    ? new Date(selectedTask.dueDate).toLocaleDateString()
                    : 'Flexible'}
                </p>
              </div>
            </div>

            {/* Move Task Status Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Move Task Status
              </h5>
              <div className="grid grid-cols-4 gap-2">
                {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'] as TaskStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      handleStatusChange(selectedTask._id, st)
                      setSelectedTask({ ...selectedTask, status: st })
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      selectedTask.status === st
                        ? 'bg-indigo-600 text-white border-transparent'
                        : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments & Mentions Section */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Discussion & Mentions ({taskComments.length})
                </h5>
              </div>

              {/* Comments Feed */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                {isCommentsLoading ? (
                  <p className="text-xs text-slate-400 py-3 text-center">Loading discussion...</p>
                ) : taskComments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No comments yet. Start the discussion below.
                  </p>
                ) : (
                  taskComments.map((cmt) => (
                    <div key={cmt._id || cmt.id} className="pt-2 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {cmt.author?.name || 'Collaborator'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {cmt.createdAt
                              ? new Date(cmt.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {cmt.text || cmt.content}
                        </p>
                      </div>

                      {(user?.role === 'OWNER' ||
                        user?.role === 'ADMIN' ||
                        cmt.author?._id === user?._id) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(cmt._id || cmt.id || '')}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          title="Delete Comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Type a comment... Use @name to mention"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Send
                </Button>
              </form>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            required
            placeholder="e.g. Implement refresh token rotation"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Project Initiative
            </label>
            <select
              value={newProjectId}
              onChange={(e) => setNewProjectId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white/70 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {projects.map((p, idx) => (
                <option key={p._id || p.id || `proj_add_${idx}`} value={p._id || p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide technical criteria..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/70 p-3 text-sm dark:border-slate-800 dark:bg-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                className="w-full rounded-xl border border-slate-200 bg-white/70 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Initial Column
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                className="w-full rounded-xl border border-slate-200 bg-white/70 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Assignee
              </label>
              <select
                value={newAssigneeId}
                onChange={(e) => setNewAssigneeId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/70 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <option value="">Unassigned</option>
                {orgMembers.map((m, idx) => {
                  const uId = m.user?._id || m.user?.id || m.userId || (m as any).id || (m as any)._id || `new_m_${idx}`
                  const uName = m.user?.name || m.user?.email || uId
                  return (
                    <option key={uId} value={uId}>
                      {uName} ({m.role})
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Due Date
              </label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/70 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900"
              />
            </div>
          </div>

          <Input
            label="Labels (comma-separated)"
            placeholder="e.g. Frontend, Auth, Sprint-1"
            value={newLabels}
            onChange={(e) => setNewLabels(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Kanban
