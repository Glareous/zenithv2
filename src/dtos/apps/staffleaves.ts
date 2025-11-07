export interface StaffLeaves {
  id: number
  staffId: string
  leaveType: string
  startDate: string
  endDate: string
  days: number
  reason: string
  approvedBy: string
  dateRequested: string
  dateApproved: string
  status: string
}
export interface LeavesListProps {
  onLeaveDataLoaded: (leaves: StaffLeaves[]) => void
}

export interface OptionType {
  label: string
  value: string
}

export const LeaveStatus: OptionType[] = [
  { label: 'Approved', value: 'Approved' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Rejected', value: 'Rejected' },
]
