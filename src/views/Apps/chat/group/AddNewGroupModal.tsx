'use client'

import React, { useState } from 'react'

import { Modal } from '@src/components/custom/modal/modal'
import { defaultGroupChatMessages, groupChatMemberList } from '@src/data'
import {
  GroupChatMemberRecord,
  GroupChatMessage,
  GroupChatRecord,
} from '@src/dtos'
import { AddNewGroupModalProps } from '@src/dtos/apps/chat'
import { AppDispatch } from '@src/slices/reducer'
import { addGroupChatRecordData } from '@src/slices/thunk'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import Select, { MultiValue } from 'react-select'

const AddNewGroupModal: React.FC<AddNewGroupModalProps> = ({
  open,
  closeModal,
  groupChatList,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<GroupChatRecord>()
  const [groupName, setGroupName] = React.useState<string>('')
  const [selectedMembersList, setSelectedMembersList] = useState<
    GroupChatMemberRecord[]
  >([])
  const [membersError, setMembersError] = useState<string | null>(null)
  const dispatch = useDispatch<AppDispatch>()
  const handleSizeChange = (
    selected: MultiValue<GroupChatMemberRecord>,
    onChange?: (value: MultiValue<GroupChatMemberRecord>) => void
  ) => {
    const selectedMembers: GroupChatMemberRecord[] = selected.map((option) => ({
      id: option.id,
      roomId: option.roomId,
      avatar: option.avatar,
      name: option.name,
      value: option.value,
      role: option.role,
    }))
    setSelectedMembersList(selectedMembers)
    setMembersError(null) // Clear error when members are selected
    if (onChange) {
      onChange(selected)
    }
  }

  // Format time
  const formatTime = (date: Date): string => {
    const today = new Date()
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()

    // Options to format the time as "10:00 AM"
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }

    // Format time as "10:00 AM"
    const timeString = new Intl.DateTimeFormat('en-US', timeOptions).format(
      date
    )

    // Return "Today" if the date is today, otherwise format as "MM/DD/YYYY"
    return isToday
      ? `Today, ${timeString}`
      : `${date.toLocaleDateString()}, ${timeString}`
  }

  const submitForm = (data: GroupChatRecord, onClose: () => void) => {
    // Check if members are selected
    if (selectedMembersList.length === 0) {
      setMembersError('Please select at least one member.')
      return
    }

    if (selectedMembersList.length <= 2) {
      setMembersError('Please select at least 3 members.')
      return
    }

    const newGroup: GroupChatRecord = {
      ...defaultGroupChatMessages,
      id:
        groupChatList && groupChatList.length > 0
          ? groupChatList.length + 1
          : 1,
      roomId: 2,
      name: groupName,
      image: '/assets/images/brands/img-27.png',
      message:
        'Wait, what’s the presentation about again? Asking for a friend… 👀📊',
      time: '09:42 AM',
      unread: false,
      active: false,
      members: selectedMembersList.map(
        (member: GroupChatMemberRecord, index: number) => ({
          id: index + 1,
          name: member.value,
          avatar: member.avatar,
          role: member.role,
        })
      ),
      messages: defaultGroupChatMessages.messages.map(
        (message: GroupChatMessage, index: number) => ({
          ...message,
          user: {
            ...message.user,
            name: selectedMembersList[index]?.name,
            avatar: selectedMembersList[index]?.avatar,
          },
          timestamp: formatTime(new Date()),
        })
      ),
    }
    dispatch(addGroupChatRecordData(newGroup))
    reset()
    onClose()
  }

  return (
    <React.Fragment>
      <Modal
        isOpen={open}
        onClose={closeModal}
        position="modal-center"
        id="createGroupModal"
        contentClass="modal-content"
        size="modal-md"
        title="New Group"
        content={(onClose) => (
          <>
            <form onSubmit={handleSubmit((data) => submitForm(data, onClose))}>
              <div className="mb-5">
                <label htmlFor="basicInput1" className="form-label">
                  Group Name
                </label>
                <input
                  type="text"
                  id="basicInput1"
                  className="form-input"
                  placeholder="Enter group title"
                  value={groupName}
                  {...register('name', {
                    required: 'Group Name is required.',
                    onChange: (e) => setGroupName(e.target.value),
                  })}
                />
                {errors.name && (
                  <span className="text-red-500">{errors.name.message}</span>
                )}
              </div>
              <div className="mb-5">
                <label htmlFor="memberSelect" className="form-label">
                  Select Members
                </label>
                <Controller
                  name="members"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="memberSelect"
                      options={groupChatMemberList}
                      isMulti
                      classNamePrefix="select"
                      onChange={(selected) =>
                        handleSizeChange(selected, field.onChange)
                      }
                      getOptionLabel={(option) => option.value}
                      getOptionValue={(option) => option.value}
                    />
                  )}
                />
                {membersError && (
                  <span className="text-red-500">{membersError}</span>
                )}
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-sub-gray"
                  onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Group
                </button>
              </div>
            </form>
          </>
        )}
      />
    </React.Fragment>
  )
}

export default AddNewGroupModal
