import React from 'react'
import { AlertCircle, CheckCircle, Info, TriangleAlert, X } from 'lucide-react'

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  onClose?: () => void
  className?: string
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) => {
  const configs = {
    info: {
      bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900',
      text: 'text-sky-800 dark:text-sky-200',
      icon: <Info className="w-5 h-5 text-sky-500" />,
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
      text: 'text-emerald-800 dark:text-emerald-200',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
      text: 'text-amber-800 dark:text-amber-200',
      icon: <TriangleAlert className="w-5 h-5 text-amber-500" />,
    },
    error: {
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
      text: 'text-rose-800 dark:text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
    },
  }

  const current = configs[type]

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border p-4 shadow-sm transition-all ${current.bg} ${current.text} ${className}`}
    >
      <div className="shrink-0 mt-0.5">{current.icon}</div>
      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <p className="opacity-90">{message}</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1 rounded-md opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-opacity"
        >
          <X className="w-4 h-4" />
          <span className="sr-only">Dismiss</span>
        </button>
      )}
    </div>
  )
}
