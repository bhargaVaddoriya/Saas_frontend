import React from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Zap,
  ArrowRight,
  Database,
  Layers,
  Plus,
  Minus,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Globe,
  SlidersHorizontal,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { increment, decrement, reset, setStep } from '../store/slices/counterSlice'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '../components/common'

export const Home: React.FC = () => {
  const dispatch = useAppDispatch()
  const { value: counterValue, step } = useAppSelector((state) => state.counter)

  const techStack = [
    { name: 'React 19', role: 'Modern UI Engine', color: 'bg-cyan-500/10 text-cyan-500' },
    { name: 'Vite 6', role: 'Lightning Fast Build', color: 'bg-amber-500/10 text-amber-500' },
    { name: 'Tailwind CSS v4', role: 'CSS-first Styling', color: 'bg-sky-500/10 text-sky-400' },
    { name: 'Redux Toolkit', role: 'Predictable State', color: 'bg-purple-500/10 text-purple-400' },
    { name: 'React Router', role: 'Client-side Routing', color: 'bg-rose-500/10 text-rose-400' },
    { name: 'Axios', role: 'Type-safe HTTP Client', color: 'bg-indigo-500/10 text-indigo-400' },
  ]

  const highlights = [
    {
      title: 'Modern Folder Structure',
      desc: 'Modular, domain-driven structure isolating components, store, services, hooks, and pages.',
      icon: Layers,
    },
    {
      title: 'Centralized Axios Client',
      desc: 'Includes global request/response interceptors, auth token injection, and friendly error handling.',
      icon: Globe,
    },
    {
      title: 'Redux Toolkit Store',
      desc: 'Configured store with async thunks, typed hooks (useAppDispatch & useAppSelector), and local storage persistence.',
      icon: Database,
    },
    {
      title: 'Design System & Components',
      desc: 'Production-ready reusable UI components (Button, Input, Card, Modal, Badge, Spinner, Alert).',
      icon: Cpu,
    },
  ]

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <div className="relative text-center space-y-6 max-w-4xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-indigo-50/70 px-4 py-1.5 text-xs font-semibold text-indigo-700 backdrop-blur-md dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
          <span>React + Vite + Tailwind CSS v4 Boilerplate</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 dark:text-white">
          Production-Ready Frontend Architecture
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Pre-configured with <strong className="text-slate-800 dark:text-slate-200">Redux Toolkit</strong>,{' '}
          <strong className="text-slate-800 dark:text-slate-200">React Router</strong>,{' '}
          <strong className="text-slate-800 dark:text-slate-200">Axios interceptors</strong>, and a suite of{' '}
          <strong className="text-slate-800 dark:text-slate-200">reusable UI components</strong>.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/posts">
            <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Axios + Redux Demo
            </Button>
          </Link>
          <Link to="/components">
            <Button variant="secondary" size="lg" leftIcon={<Layers className="w-4 h-4" />}>
              View UI Components
            </Button>
          </Link>
        </div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-6">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 px-3.5 py-1.5 text-xs font-medium backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/70"
            >
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${tech.color}`}>
                {tech.name}
              </span>
              <span className="text-slate-500 dark:text-slate-400">{tech.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Redux Demo Widget */}
      <div className="max-w-2xl mx-auto">
        <Card hoverEffect className="border-indigo-100 dark:border-indigo-950/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>Live Redux Toolkit State Demo</CardTitle>
                <p className="text-xs text-slate-500">Connected to store/slices/counterSlice.ts</p>
              </div>
            </div>
            <Badge variant="primary">Global State</Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
                Current Counter Value
              </span>
              <span className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                {counterValue}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="secondary"
                onClick={() => dispatch(decrement())}
                leftIcon={<Minus className="w-4 h-4" />}
              >
                Decrement ({step})
              </Button>

              <Button
                variant="primary"
                onClick={() => dispatch(increment())}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Increment ({step})
              </Button>

              <Button
                variant="ghost"
                onClick={() => dispatch(reset())}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Reset
              </Button>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                Step Size:
              </span>
              {[1, 5, 10].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => dispatch(setStep(s))}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    step === s
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                >
                  +{s}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Architectural Pillars */}
      <div>
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Architecture Highlights
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Everything structured for scalability, maintainability, and clean code principles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {highlights.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.title} hoverEffect className="flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Fully configured & tested</span>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
