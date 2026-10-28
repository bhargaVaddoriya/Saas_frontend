import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Compass } from 'lucide-react'
import { Button, Card } from '../components/common'

export const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Card className="max-w-md w-full p-8 space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mx-auto">
          <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">404</span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Page Not Found</h1>
          <p className="text-xs text-slate-500">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link to="/" className="inline-block">
          <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
      </Card>
    </div>
  )
}
