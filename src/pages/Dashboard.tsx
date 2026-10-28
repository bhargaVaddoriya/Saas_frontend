import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderKanban,
  AlertTriangle,
  Layers,
  Activity,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchProjects } from '../store/slices/projectSlice'
import { fetchTasks } from '../store/slices/taskSlice'
import { calculateDashboardMetrics } from '../utils/metrics'
import { dashboardService, type DashboardAnalytics } from '../services/dashboardService'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '../components/common'

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { projects } = useAppSelector((state) => state.projects)
  const { tasks } = useAppSelector((state) => state.tasks)
  const { activity } = useAppSelector((state) => state.projects)

  const [serverAnalytics, setServerAnalytics] = useState<DashboardAnalytics | null>(null)

  useEffect(() => {
    dispatch(fetchProjects())
    dispatch(fetchTasks())
    dashboardService.getAnalytics(user?.organizationId).then((data) => {
      setServerAnalytics(data)
    })
  }, [dispatch, user?.organizationId])

  const fallbackMetrics = calculateDashboardMetrics(tasks, projects)

  const metrics = serverAnalytics
    ? {
        totalProjects: serverAnalytics.projects.total || projects.length,
        activeProjects: serverAnalytics.projects.active || fallbackMetrics.activeProjects,
        completedProjects: serverAnalytics.projects.completed || fallbackMetrics.completedProjects,
        totalTasks: serverAnalytics.tasks.total || tasks.length,
        tasksByStatus: serverAnalytics.tasks.byStatus || fallbackMetrics.tasksByStatus,
        tasksByPriority: serverAnalytics.tasks.byPriority || fallbackMetrics.tasksByPriority,
        overdueTasks: serverAnalytics.tasks.overdue || fallbackMetrics.overdueTasks,
        myTasksCount: serverAnalytics.tasks.assignedToMe || fallbackMetrics.myTasksCount,
      }
    : fallbackMetrics

  const statCards = [
    {
      title: 'Total Projects',
      value: metrics.totalProjects,
      desc: `${metrics.activeProjects} active, ${metrics.completedProjects} done`,
      icon: FolderKanban,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400',
    },
    {
      title: 'Total Tasks',
      value: metrics.totalTasks,
      desc: `${metrics.tasksByStatus.COMPLETED} completed`,
      icon: Layers,
      color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-400',
    },
    {
      title: 'In Progress / Review',
      value: metrics.tasksByStatus.IN_PROGRESS + metrics.tasksByStatus.IN_REVIEW,
      desc: 'Active velocity',
      icon: TrendingUp,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400',
    },
    {
      title: 'Overdue / Critical',
      value: metrics.overdueTasks + metrics.tasksByPriority.CRITICAL,
      desc: 'Requires attention',
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400',
    },
  ]

  const statusProgress = [
    { label: 'Todo', count: metrics.tasksByStatus.TODO, color: 'bg-slate-400' },
    { label: 'In Progress', count: metrics.tasksByStatus.IN_PROGRESS, color: 'bg-indigo-500' },
    { label: 'In Review', count: metrics.tasksByStatus.IN_REVIEW, color: 'bg-amber-500' },
    { label: 'Completed', count: metrics.tasksByStatus.COMPLETED, color: 'bg-emerald-500' },
  ]

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="primary" className="bg-white/10 text-white border-white/20">
              Workspace Overview
            </Badge>
            <span className="text-xs text-indigo-200">{user?.organizationName || 'Organization Workspace'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            Welcome to your project management workspace. All routes & actions strictly enforced via RBAC.
          </p>
        </div>

        {/* Live Active Role Badge */}
        <div className="flex items-center gap-2.5 bg-black/25 px-4 py-2.5 rounded-2xl border border-white/10 shadow-inner">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-indigo-200">Role:</span>
          <Badge variant="primary" size="sm" className="bg-white/20 text-white font-extrabold uppercase border-white/20">
            {user?.role || 'MEMBER'}
          </Badge>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} hoverEffect className="flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  {stat.value}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.desc}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Analytics Charts & Task Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Status Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Task Status Distribution & Progress</CardTitle>
              <p className="text-xs text-slate-500">Live breakdown calculated across active tasks</p>
            </div>
            <Link to="/kanban">
              <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Kanban Board
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visual Multi-segment Progress Bar */}
            <div className="space-y-2">
              <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                {statusProgress.map((item) => {
                  const pct = metrics.totalTasks > 0 ? (item.count / metrics.totalTasks) * 100 : 0
                  return (
                    <div
                      key={item.label}
                      style={{ width: `${pct}%` }}
                      className={`${item.color} transition-all duration-500`}
                      title={`${item.label}: ${item.count}`}
                    />
                  )
                })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {statusProgress.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {item.label}: <strong className="text-slate-900 dark:text-white">{item.count}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Priority Grid */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Tasks by Priority Level
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Low</span>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    {metrics.tasksByPriority.LOW}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/50">
                  <span className="text-[10px] uppercase font-bold text-indigo-500">Medium</span>
                  <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                    {metrics.tasksByPriority.MEDIUM}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50">
                  <span className="text-[10px] uppercase font-bold text-amber-500">High</span>
                  <p className="text-xl font-bold text-amber-700 dark:text-amber-300">
                    {metrics.tasksByPriority.HIGH}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/50">
                  <span className="text-[10px] uppercase font-bold text-rose-500">Critical</span>
                  <p className="text-xl font-bold text-rose-700 dark:text-rose-300">
                    {metrics.tasksByPriority.CRITICAL}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Activity Feed */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <CardTitle>Activity / Audit Log</CardTitle>
            </div>
            <Badge variant="neutral" size="sm">Real-time</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No activity recorded yet.
              </div>
            ) : (
              activity.slice(0, 5).map((log) => (
                <div key={log._id} className="flex items-start gap-3 text-xs">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold dark:bg-indigo-950 dark:text-indigo-300">
                    {log.user.name[0]}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-slate-800 dark:text-slate-200">
                      <strong className="text-slate-900 dark:text-white">{log.user.name}</strong>{' '}
                      {log.action}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleDateString()} at{' '}
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projects Snapshot */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Projects</h3>
            <p className="text-xs text-slate-500">Live projects fetched from backend API</p>
          </div>
          <Link to="/projects">
            <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Projects
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card className="text-center py-10 space-y-3">
            <FolderKanban className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No projects created yet
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Get started by creating your organization's first initiative.
            </p>
            <Link to="/projects">
              <Button size="sm" variant="primary">
                Create Project
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {projects.map((project) => (
              <Card key={project._id} hoverEffect className="space-y-3">
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
                    {project.priority}
                  </Badge>
                  <span className="text-[10px] font-mono font-semibold text-slate-400">
                    {project.status}
                  </span>
                </div>

                <div>
                  <Link
                    to={`/projects/${project._id || project.id}`}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                      {project.name}
                    </h4>
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Completion</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{project.progress || 0}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${project.progress || 0}%` }}
                      className="h-full bg-indigo-600 rounded-full"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
                  <Link
                    to={`/projects/${project._id || project.id}`}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Details
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  <Link
                    to={`/kanban?projectId=${project._id || project.id}`}
                    className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                  >
                    Board
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
