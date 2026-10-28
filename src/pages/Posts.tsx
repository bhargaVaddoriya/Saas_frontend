import React, { useEffect, useState } from 'react'
import {
  Search,
  Plus,
  RefreshCw,
  Trash2,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchPosts, addPost, removePost, setSearchQuery } from '../store/slices/postSlice'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Input,
  Badge,
  Spinner,
  Modal,
  Alert,
} from '../components/common'

export const Posts: React.FC = () => {
  const dispatch = useAppDispatch()
  const { items, loading, error, searchQuery, creating } = useAppSelector(
    (state) => state.posts
  )

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (items.length === 0 && !loading && !error) {
      dispatch(fetchPosts(8))
    }
  }, [dispatch, items.length, loading, error])

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      setFormError('Title is required')
      return
    }
    if (!newBody.trim()) {
      setFormError('Content body is required')
      return
    }

    setFormError('')
    const resultAction = await dispatch(
      addPost({
        title: newTitle,
        body: newBody,
      })
    )

    if (addPost.fulfilled.match(resultAction)) {
      setNewTitle('')
      setNewBody('')
      setIsModalOpen(false)
    }
  }

  const handleDeletePost = (id: number) => {
    dispatch(removePost(id))
  }

  const filteredPosts = items.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.body.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Axios & Redux Toolkit Integration
            </h1>
            <Badge variant="success">Live API</Badge>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Demonstrating Axios HTTP client, custom interceptors, and Redux async thunks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => dispatch(fetchPosts(8))}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Reload API
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Post
          </Button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-md">
        <Input
          placeholder="Filter posts by title or content..."
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          title="API Request Failed"
          message={error}
          onClose={() => dispatch(fetchPosts(8))}
        />
      )}

      {/* Loading Skeleton / Spinner */}
      {loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Spinner size="lg" className="text-indigo-600" />
          <p className="text-sm text-slate-500 font-medium">Fetching posts from JSONPlaceholder...</p>
        </div>
      )}

      {/* Posts Grid */}
      {!loading && filteredPosts.length === 0 && !error ? (
        <Card className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No posts found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery ? 'Try adjusting your search filter' : 'No posts are currently loaded.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              hoverEffect
              className="flex flex-col justify-between border-slate-200/80 dark:border-slate-800"
            >
              <div>
                <CardHeader>
                  <Badge variant="primary" size="sm">
                    Post #{post.id}
                  </Badge>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-md"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </CardHeader>
                <CardTitle className="line-clamp-2 capitalize text-base">
                  {post.title}
                </CardTitle>
                <CardContent className="mt-3">
                  <p className="line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {post.body}
                  </p>
                </CardContent>
              </div>

              <CardFooter className="text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  JSONPlaceholder
                </span>
                <span className="font-mono text-[10px]">200 OK</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Post (Axios POST)"
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Post Title"
            placeholder="e.g. Setting up clean React architectures"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Content Body
            </label>
            <textarea
              rows={4}
              placeholder="Enter post body content..."
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/70 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={creating}>
              Publish Post
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
