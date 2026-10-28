import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Lock, Mail, ArrowRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginUser, clearAuthError } from '../store/slices/authSlice'
import { Button, Input, Card, Alert } from '../components/common'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearAuthError())

    const result = await dispatch(loginUser({ email, password }))
    if (loginUser.fulfilled.match(result)) {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/30 text-white font-black text-2xl">
            V
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome Back to SaaSFlow
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign in to access your organization workspace & projects
          </p>
        </div>

        {/* Login Form */}
        <Card className="p-8 shadow-xl">
          {error && (
            <div className="mb-4">
              <Alert
                type="error"
                title="Authentication Error"
                message={error}
                onClose={() => dispatch(clearAuthError())}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              required
              placeholder="e.g. owner@saasflow.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Workspace
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            <span>Don't have an account? </span>
            <Link to="/register" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              Register new organization
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
