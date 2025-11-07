import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface Project {
  id: string
  name: string
  description?: string
  organizationId: string
  createdById: string
  createdAt: Date
  updatedAt: Date
}

interface ProjectState {
  currentProject: Project | null
}

const initialState: ProjectState = {
  currentProject: null,
}

const ProjectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    // Set current selected project
    setCurrentProject(state, action: PayloadAction<Project | null>) {
      state.currentProject = action.payload
    },

    // Clear current project (for logout)
    clearCurrentProject(state) {
      state.currentProject = null
    },
  },
})

export const {
  setCurrentProject,
  clearCurrentProject,
} = ProjectSlice.actions

export default ProjectSlice.reducer