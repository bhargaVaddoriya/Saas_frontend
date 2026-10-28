import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
  glass?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  glass = true,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 p-6 transition-all duration-300 dark:border-slate-800/80 ${
        glass
          ? 'bg-white/70 shadow-sm backdrop-blur-md dark:bg-slate-900/70'
          : 'bg-white dark:bg-slate-900 shadow-sm'
      } ${
        hoverEffect
          ? 'hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 dark:hover:border-indigo-900/50'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800 ${className}`} {...props}>
      {children}
    </div>
  )
}

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <h3 className={`text-lg font-bold tracking-tight text-slate-900 dark:text-white ${className}`} {...props}>
      {children}
    </h3>
  )
}

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p className={`text-xs text-slate-500 dark:text-slate-400 ${className}`} {...props}>
      {children}
    </p>
  )
}

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`text-sm text-slate-600 dark:text-slate-300 ${className}`} {...props}>
      {children}
    </div>
  )
}

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`mt-5 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-sm ${className}`} {...props}>
      {children}
    </div>
  )
}
