import React, { useState } from 'react'
import {
  Sparkles,
  Send,
  Download,
  Mail,
  Lock,
  Layers,
} from 'lucide-react'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Badge,
  Spinner,
  Modal,
  Alert,
} from '../components/common'

export const ComponentsDemo: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [hasError, setHasError] = useState(false)
  const [showAlert, setShowAlert] = useState(true)

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Reusable Component Library
          </h1>
          <Badge variant="primary">Design System</Badge>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Handcrafted accessible components styled with Tailwind CSS v4, supporting dark mode & micro-interactions.
        </p>
      </div>

      {/* Buttons Showcase */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Variants, sizes, loading states, and icon placements</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Variants
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Sizes & Icons
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                Small Action
              </Button>
              <Button size="md" rightIcon={<Send className="w-4 h-4" />}>
                Send Message
              </Button>
              <Button size="lg" leftIcon={<Download className="w-4 h-4" />}>
                Download Asset
              </Button>
              <Button isLoading variant="primary">
                Processing
              </Button>
              <Button disabled variant="secondary">
                Disabled
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inputs Showcase */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Form Inputs</CardTitle>
            <CardDescription>Inputs with labels, icons, helper text, and validation error messages</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="We'll never share your email with anyone else."
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Input
              label="Interactive Input Test"
              placeholder="Type something..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setHasError(e.target.value.length > 10)
              }}
              error={hasError ? 'Cannot exceed 10 characters' : undefined}
              helperText={!hasError ? `${inputValue.length}/10 characters used` : undefined}
            />

            <Input
              label="Disabled Field"
              disabled
              value="readonly-value@domain.com"
              leftIcon={<Lock className="w-4 h-4" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Badges & Spinners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Semantic status indicators</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2.5">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Active</Badge>
            <Badge variant="warning">Pending</Badge>
            <Badge variant="danger">Failed</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="neutral">Neutral</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Spinners & Modals</CardTitle>
              <CardDescription>Loading indicators and dialog triggers</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Spinner size="sm" className="text-indigo-600" />
              <Spinner size="md" className="text-indigo-600" />
              <Spinner size="lg" className="text-indigo-600" />
            </div>

            <Button
              variant="outline"
              onClick={() => setModalOpen(true)}
              leftIcon={<Layers className="w-4 h-4" />}
            >
              Open Sample Modal
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Alert Banners</CardTitle>
            <CardDescription>Callout messages and notifications</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAlert && (
            <Alert
              type="info"
              title="Welcome to your new React + Vite project"
              message="All components are built using TypeScript and are ready for extension."
              onClose={() => setShowAlert(false)}
            />
          )}

          <Alert
            type="success"
            title="Redux Toolkit Store Initialized"
            message="Your global state is synchronized and typed."
          />

          <Alert
            type="warning"
            title="Rate Limit Notice"
            message="Free public API endpoints may enforce rate limits."
          />

          <Alert
            type="error"
            title="Network Error Handling"
            message="Axios interceptor catches any unreachable endpoint gracefully."
          />
        </CardContent>
      </Card>

      {/* Modal Demo */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Reusable Modal Component"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            This modal includes backdrop blur, keyboard ESC dismissal, trap-friendly overlay, and
            customizable content.
          </p>

          <Alert
            type="info"
            title="Accessible & Reusable"
            message="Pass any children elements into this dialog seamlessly."
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Close Modal
            </Button>
            <Button
              variant="primary"
              onClick={() => setModalOpen(false)}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Confirm Action
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
