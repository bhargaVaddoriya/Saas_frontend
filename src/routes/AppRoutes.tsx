import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'

import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { AcceptInvite } from '../pages/AcceptInvite'
import { Dashboard } from '../pages/Dashboard'
import { Projects } from '../pages/Projects'
import { ProjectDetails } from '../pages/ProjectDetails'
import { Kanban } from '../pages/Kanban'
import { OrganizationPage } from '../pages/Organization'
import { Profile } from '../pages/Profile'
import { ComponentsDemo } from '../pages/ComponentsDemo'
import { NotFound } from '../pages/NotFound'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />

      {/* Private Application Routes (Wrapped in MainLayout & ProtectedRoute) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetails />} />
        <Route path="kanban" element={<Kanban />} />

        {/* RBAC Protected: Only Organization Owners & Admins */}
        <Route
          path="organization"
          element={
            <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
              <OrganizationPage />
            </ProtectedRoute>
          }
        />

        <Route path="profile" element={<Profile />} />
        <Route path="components" element={<ComponentsDemo />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
