import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { postService } from '../../services/postService'
import type { Post } from '../../types'

interface PostState {
  items: Post[]
  loading: boolean
  error: string | null
  searchQuery: string
  creating: boolean
}

const initialState: PostState = {
  items: [],
  loading: false,
  error: null,
  searchQuery: '',
  creating: false,
}

// Async Thunk: Fetch Posts
export const fetchPosts = createAsyncThunk<Post[], number | undefined, { rejectValue: string }>(
  'posts/fetchPosts',
  async (limit = 8, { rejectWithValue }) => {
    try {
      return await postService.getPosts(limit)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch posts'
      return rejectWithValue(errorMessage)
    }
  }
)

// Async Thunk: Add Post
export const addPost = createAsyncThunk<Post, Omit<Post, 'id'>, { rejectValue: string }>(
  'posts/addPost',
  async (postData, { rejectWithValue }) => {
    try {
      const newPost = await postService.createPost(postData)
      // Fallback ID if mock API returns fixed ID
      return {
        ...newPost,
        id: newPost.id || Date.now(),
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post'
      return rejectWithValue(errorMessage)
    }
  }
)

// Async Thunk: Delete Post
export const removePost = createAsyncThunk<number, number, { rejectValue: string }>(
  'posts/removePost',
  async (id, { rejectWithValue }) => {
    try {
      await postService.deletePost(id)
      return id
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete post'
      return rejectWithValue(errorMessage)
    }
  }
)

export const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch Posts
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'An error occurred while fetching posts'
      })

    // Add Post
    builder
      .addCase(addPost.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(addPost.fulfilled, (state, action: PayloadAction<Post>) => {
        state.creating = false
        state.items.unshift(action.payload)
      })
      .addCase(addPost.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload || 'An error occurred while adding post'
      })

    // Remove Post
    builder
      .addCase(removePost.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
  },
})

export const { setSearchQuery, clearError } = postSlice.actions
export default postSlice.reducer
