import React from 'react'
import { FolderTree, Zap, Database, Globe } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../components/common'

export const Architecture: React.FC = () => {
  const treeStructure = `src/
├── assets/                  # Static media, icons, and branding
├── components/
│   ├── common/              # Reusable UI primitives (Button, Input, Card, Modal, etc.)
│   └── layout/              # Application layout shells (Navbar, Footer, MainLayout)
├── hooks/                   # Custom application hooks (e.g., useAppDispatch, useAppSelector)
├── pages/                   # Route-level views (Home, Posts, ComponentsDemo, Architecture, NotFound)
├── routes/                  # React Router configuration (AppRoutes.tsx)
├── services/
│   └── api/
│       ├── axiosClient.ts   # Centralized Axios instance with request/response interceptors
│       └── postService.ts   # Typed API service functions
├── store/
│   ├── slices/              # Redux Toolkit slices (counterSlice, postSlice, themeSlice)
│   ├── hooks.ts             # Typed Redux hooks
│   └── index.ts             # Redux store configuration & root types
├── types/                   # Shared TypeScript interfaces & types
├── App.tsx                  # Root app component with Redux Provider & Router
├── main.tsx                 # React DOM mount point
└── index.css                # Tailwind CSS v4 import & custom styles`

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Project Folder Structure & Architecture
          </h1>
          <Badge variant="primary">Documentation</Badge>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          A blueprint designed for enterprise scale, modular development, and maintainability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Directory Tree */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-indigo-500" />
              <CardTitle>Folder Structure</CardTitle>
            </div>
            <Badge variant="neutral">TypeScript</Badge>
          </CardHeader>
          <CardContent>
            <pre className="font-mono text-xs leading-relaxed p-4 rounded-xl bg-slate-900 text-slate-100 overflow-x-auto">
              {treeStructure}
            </pre>
          </CardContent>
        </Card>

        {/* Architecture Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" />
                <CardTitle>Axios Architecture</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                <strong>Centralized Axios Client:</strong> Configured in{' '}
                <code className="text-indigo-600 dark:text-indigo-400">src/services/api/axiosClient.ts</code> with baseUrl, timeouts, and headers.
              </p>
              <p>
                <strong>Request Interceptors:</strong> Automatically injects authorization tokens and logs outgoing requests in development.
              </p>
              <p>
                <strong>Response Interceptors:</strong> Uniformly parses error statuses (400, 401, 403, 404, 500) and formats friendly error messages.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-500" />
                <CardTitle>Redux Toolkit Best Practices</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                <strong>Async Thunks:</strong> Async operations managed using <code className="text-indigo-600 dark:text-indigo-400">createAsyncThunk</code> with full pending, fulfilled, and rejected lifecycle handlers.
              </p>
              <p>
                <strong>Typed Hooks:</strong> <code className="text-indigo-600 dark:text-indigo-400">useAppDispatch</code> and <code className="text-indigo-600 dark:text-indigo-400">useAppSelector</code> prevent redundant type annotations across components.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-500" />
                <CardTitle>Tailwind CSS v4 Integration</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                Powered by Vite plugin <code className="text-indigo-600 dark:text-indigo-400">@tailwindcss/vite</code> with CSS-first configuration and sub-200ms build times.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
