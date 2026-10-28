import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { taskService, type TaskQueryParams } from '../../services/taskService'
import type { Task, TaskStatus } from '../../types'

interface TaskFilter {
  projectId: string
  status: string
  priority: string
  search: string
}

interface TaskState {
  tasks: Task[]
  filter: TaskFilter
  loading: boolean
  error: string | null
}

const initialState: TaskState = {
  tasks: [],
  filter: {
    projectId: '',
    status: '',
    priority: '',
    search: '',
  },
  loading: false,
  error: null,
}

export const fetchTasks = createAsyncThunk<Task[], TaskQueryParams | undefined>(
  'tasks/fetchTasks',
  async (params) => {
    return await taskService.getTasks(params)
  }
)

export const createTask = createAsyncThunk<Task, Partial<Task>>(
  'tasks/createTask',
  async (data) => {
    return await taskService.createTask(data)
  }
)

export const updateTask = createAsyncThunk<Task, { id: string; data: Partial<Task> }>(
  'tasks/updateTask',
  async ({ id, data }) => {
    return await taskService.updateTask(id, data)
  }
)

export const updateTaskStatus = createAsyncThunk<Task, { id: string; status: TaskStatus }>(
  'tasks/updateTaskStatus',
  async ({ id, status }) => {
    return await taskService.updateTaskStatus(id, status)
  }
)

export const deleteTask = createAsyncThunk<string, string>('tasks/deleteTask', async (id) => {
  await taskService.deleteTask(id)
  return id
})

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTaskSearch: (state, action: PayloadAction<string>) => {
      state.filter.search = action.payload
    },
    setTaskStatusFilter: (state, action: PayloadAction<string>) => {
      state.filter.status = action.payload
    },
    setTaskPriorityFilter: (state, action: PayloadAction<string>) => {
      state.filter.priority = action.payload
    },
    setTaskProjectFilter: (state, action: PayloadAction<string>) => {
      state.filter.projectId = action.payload
    },
    // Instant optimistic update for silky smooth drag & drop Kanban board
    moveTaskOptimistic: (state, action: PayloadAction<{ id: string; status: TaskStatus }>) => {
      const task = state.tasks.find((t) => t._id === action.payload.id || t.id === action.payload.id)
      if (task) {
        task.status = action.payload.status
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false
        state.tasks = action.payload
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch tasks'
      })

    builder.addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload)
    })

    builder.addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
      const idx = state.tasks.findIndex((t) => t._id === action.payload._id)
      if (idx !== -1) {
        state.tasks[idx] = action.payload
      }
    })

    builder.addCase(updateTaskStatus.fulfilled, (state, action: PayloadAction<Task>) => {
      const idx = state.tasks.findIndex((t) => t._id === action.payload._id)
      if (idx !== -1) {
        state.tasks[idx] = action.payload
      }
    })

    builder.addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((t) => t._id !== action.payload && t.id !== action.payload)
    })
  },
})

export const {
  setTaskSearch,
  setTaskStatusFilter,
  setTaskPriorityFilter,
  setTaskProjectFilter,
  moveTaskOptimistic,
} = taskSlice.actions

export default taskSlice.reducer
