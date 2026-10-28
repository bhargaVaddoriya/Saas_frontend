import React, { useEffect, useState } from 'react'
import {
  Building2,
  Users,
  UserPlus,
  Trash2,
  Mail,
  Edit3,
  Plus,
  ShieldCheck,
} from 'lucide-react'
import { useAppSelector } from '../store/hooks'
import { organizationService } from '../services/organizationService'
import type { Organization, UserRole, OrganizationMember } from '../types'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Badge,
  Modal,
  Alert,
} from '../components/common'

export const OrganizationPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth)
  const [org, setOrg] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Invite Member Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('MEMBER')

  // Edit Org Modal
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  // Create Org Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDesc, setCreateDesc] = useState('')

  const isOwner = user?.role === 'OWNER'

  const refreshOrg = async () => {
    try {
      const activeOrg = await organizationService.getOrganization()
      if (activeOrg) {
        setOrg(activeOrg)
        setEditName(activeOrg.name)
        setEditDesc(activeOrg.description || '')
        const mems = await organizationService.getMembers(activeOrg._id)
        setMembers(mems)
      }
    } catch {
      // Fallback
    }
  }

  useEffect(() => {
    refreshOrg()
  }, [])

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !org) return

    try {
      const res = await organizationService.addMember(org._id, {
        email: inviteEmail,
        role: inviteRole,
      })
      setFeedback({ type: 'success', message: res.message || `Invited ${inviteEmail} as ${inviteRole}` })
      setInviteEmail('')
      setIsInviteOpen(false)
      refreshOrg()
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to invite member',
      })
    }
  }

  const handleUpdateMemberRole = async (userId: string, newRole: UserRole) => {
    if (!org) return
    try {
      await organizationService.updateMemberRole(org._id, userId, newRole)
      setFeedback({ type: 'success', message: `Updated member role to ${newRole}` })
      refreshOrg()
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update member role',
      })
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!org) return
    if (confirm('Are you sure you want to remove this member from the organization?')) {
      try {
        await organizationService.removeMember(org._id, userId)
        setFeedback({ type: 'success', message: 'Member removed from workspace' })
        refreshOrg()
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: err.response?.data?.message || 'Failed to remove member',
        })
      }
    }
  }

  const handleEditOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!org || !editName.trim()) return

    try {
      const updated = await organizationService.updateOrganization(org._id, {
        name: editName,
        description: editDesc,
      })
      setOrg(updated)
      setIsEditOpen(false)
      setFeedback({ type: 'success', message: 'Organization updated successfully.' })
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update organization',
      })
    }
  }

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createName.trim()) return

    try {
      const newOrg = await organizationService.createOrganization({
        name: createName,
        description: createDesc,
      })
      setOrg(newOrg)
      setIsCreateOpen(false)
      setCreateName('')
      setCreateDesc('')
      setFeedback({
        type: 'success',
        message: `Created new organization "${newOrg.name}". You are the OWNER.`,
      })
      refreshOrg()
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create organization',
      })
    }
  }

  if (!org) {
    return (
      <div className="text-center py-16 space-y-4">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          No Organization Loaded
        </h2>
        <p className="text-sm text-slate-500">Create your workspace organization to get started.</p>
        <Button variant="primary" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Create Workspace
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Feedback Alert */}
      {feedback && (
        <Alert
          type={feedback.type}
          title={feedback.type === 'success' ? 'Success' : 'Error'}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Organization & Workspace Settings
            </h1>
            <Badge variant="primary">RBAC Governed</Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage organization credentials, multi-tenant isolation, and team member roles
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit Workspace
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Invite Member
          </Button>
        </div>
      </div>

      {/* Organization Meta Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>{org.name}</CardTitle>
              <p className="text-xs text-slate-500">Tenant Slug: {org.slug || org._id}</p>
            </div>
          </div>
          <Badge variant="success">Active Tenant</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {org.description || 'Enterprise workspace provisioned for high-velocity project management.'}
          </p>
          <div className="flex flex-wrap gap-6 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Created:</span>{' '}
              {new Date(org.createdAt || Date.now()).toLocaleDateString()}
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Total Members:</span>{' '}
              {members.length > 0 ? members.length : org.members?.length || 1}
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Data Isolation:</span>{' '}
              Tenant Scoped
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Management Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <CardTitle>Workspace Members & Permissions</CardTitle>
          </div>
          <span className="text-xs text-slate-400">
            {members.length > 0 ? members.length : org.members?.length || 1} Total Members
          </span>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase font-bold text-slate-500 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(members.length > 0 ? members : org.members || []).map((member) => {
                  const mUser = member.user || { name: 'User', email: '' }
                  const mId = member.userId || (member.user as any)?._id || (member as any)._id

                  return (
                    <tr key={mId} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {mUser.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {mUser.name}
                          </p>
                          <p className="text-xs text-slate-400">{mUser.email}</p>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {isOwner && member.role !== 'OWNER' ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateMemberRole(mId, e.target.value as UserRole)}
                            className="rounded-lg border border-slate-200 bg-white/80 p-1 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900"
                          >
                            <option value="MEMBER">MEMBER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        ) : (
                          <Badge
                            variant={
                              member.role === 'OWNER'
                                ? 'primary'
                                : member.role === 'ADMIN'
                                ? 'warning'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {member.role}
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-500">
                        {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'Active'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {member.role !== 'OWNER' && isOwner ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(mId)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Owner</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Organization Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Organization Details">
        <form onSubmit={handleEditOrg} className="space-y-4">
          <Input
            label="Organization Name"
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invite Member Modal */}
      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite Member to Workspace">
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="Member Email"
            type="email"
            required
            placeholder="colleague@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Assign Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as UserRole)}
              className="w-full rounded-xl border border-slate-200 bg-white/70 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="MEMBER">Member (Contributor)</option>
              <option value="ADMIN">Admin / Manager (Project Lead)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Organization Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Workspace Organization">
        <form onSubmit={handleCreateOrg} className="space-y-4">
          <Input
            label="Organization Name"
            required
            placeholder="e.g. Acme Cloud Innovations"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Workspace objectives and scope..."
              value={createDesc}
              onChange={(e) => setCreateDesc(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/70 p-3 text-sm dark:border-slate-800 dark:bg-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default OrganizationPage
