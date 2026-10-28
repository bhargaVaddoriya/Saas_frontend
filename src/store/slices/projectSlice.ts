import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { projectService } from '../../services/projectService'
import type { Project, ActivityLog } from '../../types'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  activity: ActivityLog[]
  loading: boolean
  error: string | null
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  activity: [],
  loading: false,
  error: null,
}

export const fetchProjects = createAsyncThunk('projects/fetchProjects', async () => {
  return await projectService.getProjects()
})

export const createProject = createAsyncThunk<Project, Partial<Project>>(
  'projects/createProject',
  async (data) => {
    return await projectService.createProject(data)
  }
)

export const updateProject = createAsyncThunk<Project, { id: string; data: Partial<Project> }>(
  'projects/updateProject',
  async ({ id, data }) => {
    return await projectService.updateProject(id, data)
  }
)

export const deleteProject = createAsyncThunk<string, string>(
  'projects/deleteProject',
  async (id) => {
    await projectService.deleteProject(id)
    return id
  }
)

export const fetchActivity = createAsyncThunk<ActivityLog[], string | undefined>(
  'projects/fetchActivity',
  async (projectId) => {
    return await projectService.getActivity(projectId)
  }
)

export const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.loading = false
        state.projects = action.payload
        if (!state.currentProject && action.payload.length > 0) {
          state.currentProject = action.payload[0]
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch projects'
      })

    builder.addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
      state.projects.unshift(action.payload)
      state.currentProject = action.payload
    })

    builder.addCase(updateProject.fulfilled, (state, action: PayloadAction<Project>) => {
      const idx = state.projects.findIndex((p) => p._id === action.payload._id)
      if (idx !== -1) {
        state.projects[idx] = action.payload
      }
      if (state.currentProject?._id === action.payload._id) {
        state.currentProject = action.payload
      }
    })

    builder.addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p._id !== action.payload)
      if (state.currentProject?._id === action.payload) {
        state.currentProject = state.projects[0] || null
      }
    })

    builder.addCase(fetchActivity.fulfilled, (state, action: PayloadAction<ActivityLog[]>) => {
      state.activity = action.payload
    })
  },
})

export const { setCurrentProject } = projectSlice.actions
export default projectSlice.reducer
