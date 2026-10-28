import React, { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, id, className = '', ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 flex items-center text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-xl border bg-white/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 backdrop-blur-sm focus:outline-none focus:ring-2 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500 ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500/50'
                : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-800 dark:hover:border-slate-700'
            } ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="pointer-events-none absolute right-3 flex items-center text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-rose-500">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
