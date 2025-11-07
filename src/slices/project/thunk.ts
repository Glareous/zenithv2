import { AppDispatch } from '@src/slices/reducer'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import {
  clearCurrentProject,
  setCurrentProject,
} from './reducer'

// Select a specific project as current
export const selectProject = 
  (project: any) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setCurrentProject(project))
      
      // Store in localStorage for persistence
      localStorage.setItem('currentProject', JSON.stringify(project))
      
      toast.success(`Switched to ${project.name}`, { autoClose: 2000 })
    } catch (error) {
      console.error('Error selecting project:', error)
      toast.error('Failed to select project', { autoClose: 3000 })
    }
  }

// Load current project from localStorage
export const loadCurrentProjectFromStorage = () => async (dispatch: AppDispatch) => {
  try {
    const storedProject = localStorage.getItem('currentProject')
    if (storedProject) {
      const project = JSON.parse(storedProject)
      dispatch(setCurrentProject(project))
    }
  } catch (error) {
    console.error('Error loading project from storage:', error)
    localStorage.removeItem('currentProject') // Clear corrupted data
  }
}

// Clear current project (for logout)
export const clearProjectData = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(clearCurrentProject())
    localStorage.removeItem('currentProject')
  } catch (error) {
    console.error('Error clearing project data:', error)
  }
}