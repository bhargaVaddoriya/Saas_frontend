import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Building2, User, Lock, Mail, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'
import { authService } from '../services/authService'
import { useAppDispatch } from '../store/hooks'
import { setAuthSession } from '../store/slices/authSlice'
import { Button, Input, Card, Alert } from '../components/common'

interface InviteInfo {
  email: string
  role: string
  organization?: { id?: string; name: string; slug?: string } | null
  invitedBy?: { name: string } | null
  expiresAt: string
  isNewUser: boolean
  userName?: string
}

export const AcceptInvite: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const token = searchParams.get('token')

  const [verifying, setVerifying] = useState(true)
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)
  const [verifyError, setVerifyError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setVerifying(false)
      setVerifyError('No invitation token found in the URL. Please check the link from your email.')
      return
    }

    const checkToken = async () => {
      try {
        setVerifying(true)
        const info = await authService.verifyInvite(token)
        setInviteInfo(info)
        if (info.userName) {
          setName(info.userName)
        }
      } catch (err: any) {
        setVerifyError(
          err.response?.data?.message || 'This invitation is invalid or has expired. Please ask for a new invitation.'
        )
      } finally {
        setVerifying(false)
      }
    }

    checkToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setSubmitError(null)

    // Validate password for new users
    if (inviteInfo?.isNewUser && (!password || password.length < 6)) {
      setSubmitError('Please enter a password with at least 6 characters.')
      return
    }

    if (password && password !== confirmPassword) {
      setSubmitError('Passwords do not match. Please re-enter.')
      return
    }

    try {
      setSubmitting(true)
      const res = await authService.acceptInvite({
        token,
        name: name.trim() || undefined,
        password: password || undefined,
      })

      if (res.token && res.user) {
        dispatch(setAuthSession({ user: res.user, token: res.token }))
      }

      setSuccessMessage('Invitation accepted! Redirecting to your workspace...')
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 1500)
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to accept invitation. Please try again.')
      setSubmitting(false)
    }
  }

  // Loading state
  if (verifying) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 shadow-xl">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verifying Invitation</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Please wait while we validate your invitation token...
          </p>
        </Card>
      </div>
    )
  }

  // Error state (invalid / expired token)
  if (verifyError || !inviteInfo) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border-red-200 dark:border-red-900">
          <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Invalid Invitation</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {verifyError || 'This invitation link is not valid.'}
            </p>
          </div>
          <div className="pt-2">
            <Link to="/login">
              <Button variant="primary" className="w-full">
                Go to Sign In
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  // Success state
  if (successMessage) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 shadow-xl border-emerald-200 dark:border-emerald-900">
          <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Aboard! 🎉</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{successMessage}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Organization Invitation Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/30 text-white">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Join {inviteInfo.organization?.name || 'Organization'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {inviteInfo.invitedBy?.name || 'An administrator'} has invited you to join as{' '}
            <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <ShieldCheck className="h-3 w-3" />
              {inviteInfo.role}
            </span>
          </p>
        </div>

        {/* Invitation Form Card */}
        <Card className="p-8 shadow-xl">
          {submitError && (
            <div className="mb-4">
              <Alert
                type="error"
                title="Invitation Error"
                message={submitError}
                onClose={() => setSubmitError(null)}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (Read only) */}
            <Input
              label="Invited Email"
              type="email"
              value={inviteInfo.email}
              disabled
              leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
              helperText="This invitation is bound to this specific email address."
            />

            {/* Display Name */}
            <Input
              label="Your Full Name"
              type="text"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="h-4 w-4 text-slate-400" />}
            />

            {/* Password Setup */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {inviteInfo.isNewUser ? 'Set Account Password' : 'Password Setup (Optional)'}
              </div>

              <Input
                label={inviteInfo.isNewUser ? 'Password' : 'New Password (leave empty to keep current)'}
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={inviteInfo.isNewUser}
                leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
              />

              {password ? (
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                />
              ) : null}
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={submitting}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Accept Invitation & Join Workspace
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            Already have an active session?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-semibold">
              Sign in with existing credentials
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
