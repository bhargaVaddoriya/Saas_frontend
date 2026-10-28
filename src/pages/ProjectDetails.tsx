import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Layers,
  Users,
  UserPlus,
  Trash2,
  Edit3,
  ArrowLeft,
  Activity,
  Clock,
  Shield,
} from 'lucide-react'
import { useAppSelector } from '../store/hooks'
import { projectService } from '../services/projectService'
import { organizationService } from '../services/organizationService'
import type {
  Project,
  ProjectProgress,
  ProjectMember,
  ActivityLog,
  ProjectStatus,
  ProjectPriority,
  OrganizationMember,
} from '../types'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Modal,
  Input,
  Spinner,
  Alert,
} from '../components/common'

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)

  const [project, setProject] = useState<Project | null>(null)
  const [progress, setProgress] = useState<ProjectProgress | null>(null)
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([])
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  // Edit Project Modal
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editStatus, setEditStatus] = useState<ProjectStatus>('ACTIVE')
  const [editPriority, setEditPriority] = useState<ProjectPriority>('MEDIUM')

  // Add Member Modal
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [memberRole, setMemberRole] = useState<'MANAGER' | 'MEMBER'>('MEMBER')
  const [addMemberError, setAddMemberError] = useState<string | null>(null)
  const [addMemberSubmitting, setAddMemberSubmitting] = useState(false)

  const isOwner = user?.role === 'OWNER'
  const isManagerOrAdmin = user?.role === 'OWNER' || user?.role === 'ADMIN'

  useEffect(() => {
    if (!id) return
    setLoading(true)

    Promise.all([
      projectService.getProjectById(id),
      projectService.getProjectProgress(id),
      projectService.getProjectMembers(id),
      projectService.getActivity(id),
    ])
      .then(([projData, progData, memData, actData]) => {
        setProject(projData)
        setEditName(projData.name)
        setEditDesc(projData.description || '')
        setEditStatus(projData.status)
        setEditPriority(projData.priority)
        setProgress(progData)
        setMembers(memData)
        setActivity(actData)
      })
      .finally(() => setLoading(false))

    // Also fetch organization members for member assignment
    organizationService.getOrganization().then((org) => {
      if (org?._id) {
        organizationService.getMembers(org._id).then((m) => {
          setOrgMembers(m)
          if (m.length > 0) {
            const firstId = (m[0].user as any)?._id || (m[0].user as any)?.id || m[0].userId || (m[0] as any)._id
            if (firstId) setSelectedUserId(firstId)
          }
        })
      }
    })
  }, [id])

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !editName.trim()) return

    const updated = await projectService.updateProject(id, {
      name: editName,
      description: editDesc,
      status: editStatus,
      priority: editPriority,
    })
    setProject(updated)
    setIsEditOpen(false)
  }

  const handleDeleteProject = async () => {
    if (!id) return
    if (confirm('Are you sure you want to archive this project?')) {
      await projectService.deleteProject(id)
      navigate('/projects')
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    // Ensure we have a valid user ID (fallback to first member if not explicitly changed)
    const targetUserId =
      selectedUserId ||
      (orgMembers.length > 0
        ? (orgMembers[0].user as any)?._id || (orgMembers[0].user as any)?.id || orgMembers[0].userId
        : '')

    if (!targetUserId) {
      setAddMemberError('Please select a workspace member to add.')
      return
    }

    try {
      setAddMemberSubmitting(true)
      setAddMemberError(null)
      await projectService.addProjectMember(id, targetUserId, memberRole)
      const updatedMembers = await projectService.getProjectMembers(id)
      setMembers(updatedMembers)
      setIsAddMemberOpen(false)
    } catch (err: any) {
      setAddMemberError(err.response?.data?.message || 'Failed to add member to project.')
    } finally {
      setAddMemberSubmitting(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!id) return
    if (confirm('Remove this member from the project?')) {
      await projectService.removeProjectMember(id, userId)
      setMembers((prev) =>
        prev.filter((m) => {
          const uid = typeof m.userId === 'string' ? m.userId : (m.userId as { _id?: string })._id
          return uid !== userId
        })
      )
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Project Not Found</h2>
        <p className="text-sm text-slate-500">The project could not be loaded or was archived.</p>
        <Link to="/projects">
          <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Projects
          </Button>
        </Link>
      </div>
    )
  }

  const progressPct = progress?.progressPercentage ?? project.progress ?? 0

  return (
    <div className="space-y-8">
      {/* Top Navigation & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects Workspace
        </Link>

        <div className="flex items-center gap-2">
          {isManagerOrAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditOpen(true)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit Details
            </Button>
          )}

          {isOwner && (
            <Button
              size="sm"
              variant="danger"
              onClick={handleDeleteProject}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Archive
            </Button>
          )}

          <Link to={`/kanban?projectId=${project._id || project.id}`}>
            <Button size="sm" variant="primary" leftIcon={<Layers className="w-3.5 h-3.5" />}>
              Open Kanban Board
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Project Hero Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  project.status === 'COMPLETED'
                    ? 'success'
                    : project.status === 'ACTIVE'
                    ? 'primary'
                    : 'warning'
                }
                size="md"
              >
                {project.status}
              </Badge>
              <Badge
                variant={
                  project.priority === 'CRITICAL' || project.priority === 'HIGH'
                    ? 'danger'
                    : 'neutral'
                }
                size="md"
              >
                {project.priority} PRIORITY
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {project.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {project.description || 'No detailed description provided for this initiative.'}
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-right">
              <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                Completion Rate
              </span>
              <p className="text-3xl font-black text-indigo-700 dark:text-indigo-300">
                {progressPct}%
              </p>
              <span className="text-[11px] text-slate-500">
                {progress?.completedTasks ?? 0} of {progress?.totalTasks ?? 0} tasks done
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-500">Sprint Progress</span>
            <span className="text-indigo-600 dark:text-indigo-400">{progressPct}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              style={{ width: `${progressPct}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 transition-all duration-500 rounded-full"
            />
          </div>
        </div>

        {/* Project Meta Information Footer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Due Date</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Flexible'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Created</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Team Size</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {members.length > 0 ? `${members.length} members` : 'Open project'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-500" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Your Permission</p>
              <p className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
                {user?.role || 'MEMBER'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid: Project Team Members & Activity Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Members (2 Columns) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <CardTitle>Project Team Members ({members.length})</CardTitle>
              </div>
              {isManagerOrAdmin && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddMemberOpen(true)}
                  leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                >
                  Add Member
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                <p>No individual members explicitly assigned to this project yet.</p>
                {isManagerOrAdmin && (
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                    Click "Add Member" to assign contributors.
                  </p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {members.map((m, idx) => {
                  const memberUser =
                    typeof m.userId === 'object' && m.userId !== null
                      ? (m.userId as any)
                      : m.user || { name: 'Team Member', email: '' }
                  const memberId =
                    typeof m.userId === 'string'
                      ? m.userId
                      : (m.userId as any)?._id || (m as any)._id || idx

                  return (
                    <div
                      key={memberId}
                      className="py-3 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold dark:bg-indigo-950 dark:text-indigo-300">
                          {memberUser.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {memberUser.name}
                          </p>
                          <p className="text-slate-400">{memberUser.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={m.role === 'MANAGER' ? 'primary' : 'neutral'}
                          size="sm"
                        >
                          {m.role}
                        </Badge>
                        {isManagerOrAdmin && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(memberId)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Activity Timeline (1 Column) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <CardTitle>Project Activity Feed</CardTitle>
            </div>
            <Badge variant="neutral" size="sm">
              Live
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No activity logged for this project yet.
              </div>
            ) : (
              activity.slice(0, 6).map((log) => (
                <div key={log._id} className="flex items-start gap-3 text-xs">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-bold">
                    {log.user?.name?.[0] || 'U'}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-slate-800 dark:text-slate-200">
                      <strong>{log.user?.name || 'Someone'}</strong> {log.action}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Project Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Project Details">
        <form onSubmit={handleUpdateProject} className="space-y-4">
          <Input
            label="Project Name"
            required
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/70 p-3 text-sm dark:border-slate-800 dark:bg-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as ProjectStatus)}
                className="w-full rounded-xl border border-slate-200 bg-white/70 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as ProjectPriority)}
                className="w-full rounded-xl border border-slate-200 bg-white/70 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Project Member Modal */}
      <Modal
        isOpen={isAddMemberOpen}
        onClose={() => {
          setIsAddMemberOpen(false)
          setAddMemberError(null)
        }}
        title="Add Member to Project"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          {addMemberError && (
            <Alert
              type="error"
              title="Assignment Error"
              message={addMemberError}
              onClose={() => setAddMemberError(null)}
            />
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Select Workspace Member
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/70 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {orgMembers.map((m, idx) => {
                const uId = (m.user as any)?._id || (m.user as any)?.id || m.userId || (m as any)._id || `mem_${idx}`
                const uName = m.user?.name || m.userId || 'Member'
                const uEmail = m.user?.email ? ` (${m.user.email})` : ''
                return (
                  <option key={uId} value={uId}>
                    {uName}{uEmail}
                  </option>
                )
              })}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Project Role
            </label>
            <select
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value as 'MANAGER' | 'MEMBER')}
              className="w-full rounded-xl border border-slate-200 bg-white/70 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="MEMBER">Member (Contributor)</option>
              <option value="MANAGER">Manager (Project Lead)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddMemberOpen(false)
                setAddMemberError(null)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={addMemberSubmitting}>
              Assign Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ProjectDetails
