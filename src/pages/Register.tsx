import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, User, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { registerUser, clearAuthError } from '../store/slices/authSlice'
import type { UserRole } from '../types'
import { Button, Input, Card, Alert } from '../components/common'

export const Register: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.auth)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const role: UserRole = 'ADMIN'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearAuthError())

    const result = await dispatch(
      registerUser({
        name,
        email,
        password,
        organizationName,
        role,
      })
    )

    if (registerUser.fulfilled.match(result)) {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/30 text-white font-black text-2xl">
            V
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create Your SaaS Workspace
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign up as an Organization Owner to initialize your team workspace
          </p>
        </div>

        <Card className="p-8 shadow-xl">
          {error && (
            <div className="mb-4">
              <Alert
                type="error"
                title="Registration Error"
                message={error}
                onClose={() => dispatch(clearAuthError())}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Organization / Company Name"
              required
              placeholder="e.g. Acme Technologies"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              leftIcon={<Building2 className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                placeholder="e.g. Alex Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />

              <Input
                label="Work Email"
                type="email"
                required
                placeholder="alex@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/60 dark:border-indigo-950/60 dark:bg-indigo-950/30 text-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shrink-0 shadow-xs text-sm">
                👑
              </div>
              <div className="flex-1">
                <span className="font-bold text-slate-900 dark:text-white">
                  Designated Role: Organization Admin (ADMIN)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Only Organization ADMIN can sign up to register a workspace. Team members and owners are invited afterward.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Organization & Continue
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            <span>Already have an account? </span>
            <Link to="/login" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              Sign in here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
