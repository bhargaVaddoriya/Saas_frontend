import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  LogOut,
  Building2,
  Calendar,
  Lock,
  CheckCircle2,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logoutUser } from '../store/slices/authSlice'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '../components/common'

export const Profile: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Account Profile & Permissions
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          View your active workspace account, role capabilities, and security details
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <Card className="text-center p-6 space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-black text-3xl shadow-lg shadow-indigo-500/25">
            {user.name[0]}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h3>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>

          <div className="flex justify-center">
            <Badge
              variant={
                user.role === 'OWNER'
                  ? 'primary'
                  : user.role === 'ADMIN'
                  ? 'warning'
                  : 'neutral'
              }
              size="md"
            >
              {user.role}
            </Badge>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4" />}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </Card>

        {/* Permissions & Security Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-500" />
                <CardTitle>RBAC Role Capabilities</CardTitle>
              </div>
              <Badge variant="primary">Enforced by Backend</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {user.role === 'OWNER'
                    ? '👑 Organization Owner (Full Control)'
                    : user.role === 'ADMIN'
                    ? '🛡️ Admin / Manager (Projects & Tasks)'
                    : '👤 Contributor / Member (Assigned Tasks)'}
                </span>
                <p className="text-slate-500 leading-relaxed">
                  {user.role === 'OWNER'
                    ? 'Can invite/remove members, assign project roles, delete projects, and view all audit activity.'
                    : user.role === 'ADMIN'
                    ? 'Can manage projects, create/assign tasks, and view project analytics.'
                    : 'Can view assigned projects, transition task statuses, and post comments.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Secure Session Card (Token is safely hidden and protected) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                <CardTitle>Session Security & Identity</CardTitle>
              </div>
              <Badge variant="success">Authenticated</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="font-semibold">Workspace</span>
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {user.organizationName || 'Acme Technologies Inc.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="font-semibold">Member Since</span>
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'February 2026'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-semibold">Protection Standard</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    JWT credentials are secure, encrypted in transit, and handled automatically by internal HTTP interceptors without exposure.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
