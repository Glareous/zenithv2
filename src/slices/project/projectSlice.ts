import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface Project {
  id: string
  name: string
  description?: string
  organizationId: string // Agregar esta línea
  createdById: string // Agregar esta línea
  createdAt: string
  updatedAt: string
}

interface ProjectState {
  currentProject: Project | null
  projects: Project[]
  isLoading: boolean
  error: string | null
}

const initialState: ProjectState = {
  currentProject: null,
  projects: [],
  isLoading: false,
  error: null,
}

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload
    },
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload)
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.projects[index] = action.payload
      }
      if (state.currentProject?.id === action.payload.id) {
        state.currentProject = action.payload
      }
    },
    removeProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload)
      if (state.currentProject?.id === action.payload) {
        state.currentProject = null
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setCurrentProject,
  setProjects,
  addProject,
  updateProject,
  removeProject,
  setLoading,
  setError,
  clearError,
} = projectSlice.actions

export default projectSlice.reducer
