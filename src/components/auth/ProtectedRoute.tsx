import React from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'
import { useAppSelector } from '../../store/hooks'
import type { UserRole } from '../../types'
import { Button, Card, Badge } from '../common'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const location = useLocation()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  // 1. Check Authentication (Private Route Gate)
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 2. Check Role-Based Access Control (RBAC Gate)
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center p-8 space-y-6 border-rose-200 dark:border-rose-950/60 shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="danger">403 Forbidden</Badge>
              <Badge variant="neutral">Your Role: {user.role}</Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Access Restricted
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This area is restricted to{' '}
              <strong className="text-slate-900 dark:text-slate-200">
                {allowedRoles.join(', ')}
              </strong>
              . Your current account has the role <strong className="text-rose-500">{user.role}</strong>. Contact your workspace administrator to request elevated permissions.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
            <Link to="/dashboard">
              <Button
                variant="primary"
                leftIcon={<Home className="w-4 h-4" />}
              >
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
