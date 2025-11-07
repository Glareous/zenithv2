import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { ProjectList } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface ProjectListState {
  projectList: ProjectList[]
  isLoading: boolean
}

const initialState: ProjectListState = {
  projectList: initStore('d-project-list') as ProjectList[],
  isLoading: false,
}

const ProjectSlice = createSlice({
  name: 'projectlist',
  initialState,
  reducers: {
    getProjectList(state, action: PayloadAction<ProjectList[]>) {
      state.projectList = action.payload
    },

    deleteProjectList(state, action: PayloadAction<number[]>) {
      if (state.projectList !== null) {
        state.projectList = state.projectList.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },

    editProjectList(state, action: PayloadAction<ProjectList>) {
      const projectList = action.payload
      if (state.projectList !== null) {
        const findProjectIndex = state.projectList.findIndex(
          (item) => item.id === projectList.id
        )
        const findProjectRecord = state.projectList.find(
          (item) => item.id === projectList.id
        )
        if (findProjectIndex !== -1 && findProjectRecord) {
          state.projectList[findProjectIndex] = projectList
        }
      }
    },

    addProjectList(state, action: PayloadAction<ProjectList>) {
      const newProject = action.payload
      if (state.projectList !== null) {
        state.projectList.unshift(newProject)
      } else {
        state.projectList = [newProject]
      }
    },
  },
})

export const {
  getProjectList,
  addProjectList,
  editProjectList,
  deleteProjectList,
} = ProjectSlice.actions
export default ProjectSlice.reducer
