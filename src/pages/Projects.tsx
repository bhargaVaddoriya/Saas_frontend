import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  Calendar,
  Trash2,
  Lock,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { createProject, deleteProject } from '../store/slices/projectSlice'
import type { ProjectStatus, ProjectPriority } from '../types'
import {
  Button,
  Card,
  Input,
  Badge,
  Modal,
} from '../components/common'

export const Projects: React.FC = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { projects } = useAppSelector((state) => state.projects)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // New Project Form State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status] = useState<ProjectStatus>('ACTIVE')
  const [priority, setPriority] = useState<ProjectPriority>('MEDIUM')
  const [dueDate, setDueDate] = useState('2026-06-30')

  // RBAC Permission Checks
  const canCreateProject = user?.role === 'OWNER' || user?.role === 'ADMIN'
  const canDeleteProject = user?.role === 'OWNER'

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    await dispatch(
      createProject({
        name,
        description,
        status,
        priority,
        dueDate,
        startDate: new Date().toISOString().split('T')[0],
      })
    )

    setName('')
    setDescription('')
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project? This action is permanent.')) {
      dispatch(deleteProject(id))
    }
  }

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter ? p.status === statusFilter : true
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Projects Workspace
            </h1>
            <Badge variant="primary">{projects.length} Total</Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage organizations initiatives, milestones, and deliverables
          </p>
        </div>

        {canCreateProject ? (
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create New Project
          </Button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-xs text-slate-500 dark:bg-slate-800">
            <Lock className="w-3.5 h-3.5" />
            <span>Member Role: View-only</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:max-w-md">
          <Input
            placeholder="Search projects by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['', 'PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
              }`}
            >
              {st || 'All Statuses'}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <Card className="text-center py-16 space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {search || statusFilter ? 'No matching projects found' : 'No projects created yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || statusFilter
              ? 'Try clearing your search query or status filter.'
              : 'Create your first project to start tracking tasks and team velocity.'}
          </p>
          {canCreateProject && !search && !statusFilter && (
            <Button size="sm" variant="primary" onClick={() => setIsModalOpen(true)}>
              Create First Project
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <Card key={project._id} hoverEffect className="flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                <Badge
                  variant={
                    project.priority === 'CRITICAL'
                      ? 'danger'
                      : project.priority === 'HIGH'
                      ? 'warning'
                      : 'primary'
                  }
                  size="sm"
                >
                  {project.priority} Priority
                </Badge>

                {canDeleteProject && (
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Delete project (Owner only)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <Link
                  to={`/projects/${project._id || project.id}`}
                  className="group-hover:text-indigo-600 transition-colors"
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400">
                    {project.name}
                  </h3>
                </Link>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mt-1.5 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Progress</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{project.progress || 0}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${project.progress || 0}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Due {project.dueDate || 'Flexible'}
              </span>

              <div className="flex items-center gap-2">
                <Link
                  to={`/projects/${project._id || project.id}`}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Details
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <Link
                  to={`/kanban?projectId=${project._id || project.id}`}
                  className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                  title="Open Kanban Board"
                >
                  <Layers className="w-3 h-3" />
                  Board
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Project Name"
            required
            placeholder="e.g. Next-Gen Mobile Experience"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Project Description
            </label>
            <textarea
              rows={3}
              placeholder="Outline project objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/70 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProjectPriority)}
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
                Target Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/70 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
