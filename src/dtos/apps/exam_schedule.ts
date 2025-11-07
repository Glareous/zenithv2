export interface ExamSchedule {
  id: number
  testId: string
  testName: string
  testCategory: string
  testType: string
  class: string
  startDate: string
  endDate: string
  status: string
}
export interface OptionType {
  label: string
  value: string
}

export const categoryItems: OptionType[] = [
  { label: 'Final Test', value: 'Final Test' },
  { label: 'Practice Test', value: 'Practice Test' },
  { label: 'Midterm Test', value: 'Midterm Test' },
  { label: 'Quarterly Test', value: 'Quarterly Test' },
]

export const testType: OptionType[] = [
  { label: 'General', value: 'General' },
  { label: 'Formative', value: 'Formative' },
  { label: 'Summative', value: 'Summative' },
  { label: 'Online', value: 'Online' },
  { label: 'Rejoining', value: 'Rejoining' },
]

export const stdClass: OptionType[] = [
  { label: 'STD 6', value: '6' },
  { label: 'STD 7', value: '7' },
  { label: 'STD 8', value: '8' },
  { label: 'STD 9', value: '9' },
  { label: 'STD 10', value: '10' },
  { label: 'STD 11', value: '11' },
  { label: 'STD 12', value: '12' },
]

export const examStatusOption: OptionType[] = [
  { label: 'New', value: 'New' },
  { label: 'Scheduled', value: 'Scheduled' },
  { label: 'Completed', value: 'Completed' },
]

export interface AddEditExamScheduleProps {
  modalState: {
    showAddExamForm: boolean
    showEditExamForm: boolean
  }
  closeModal: (modal: string) => void
  examList: ExamSchedule[]
  editMode: boolean
  currentExam?: ExamSchedule | undefined
}
