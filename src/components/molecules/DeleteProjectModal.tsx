// ...importaciones necesarias (React, useState, etc.)
import React, { useState } from 'react'

import { Modal } from '@src/components/custom/modal/modal'

interface DeleteProjectModalProps {
  show: boolean
  onClose: () => void
  onDelete: () => Promise<void>
  projectName: string
  loading?: boolean
}

const DELETE_CONFIRM_WORD = 'DELETE'

const deleteItems = [
  'Project members and their roles',
  'Project FAQs and content',
  'Project files and metadata',
  'Project-specific settings/configurations',
  'Agents belonging to the project',
  'Products associated with the project',
  'Chat conversations and messages',
  'Analytics or tracking data',
  'Project logos/images',
  'Uploaded documents',
  'Generated files or exports',
  'Cached or temporary files',
]

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  show,
  onClose,
  onDelete,
  projectName,
  loading = false,
}) => {
  const [confirmText, setConfirmText] = useState('')

  const isConfirmed =
    confirmText === projectName || confirmText === DELETE_CONFIRM_WORD

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title="Delete Project"
      size="modal-md"
      position="modal-center"
      content={
        <>
          <p className="mb-3 ">
            This action is <b>irreversible</b>. The following will be deleted:
          </p>
          <ul className="list-disc pl-6 mb-4 text-sm">
            {deleteItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mb-2 text-sm ">
            To confirm, type <b>{projectName}</b> or <b>DELETE</b> below:
          </p>
          <input
            className="w-full border rounded px-3 py-2 mb-4"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`Type "${projectName}" or "DELETE"`}
            disabled={loading}
          />
        </>
      }
      footer={
        <div className="flex justify-end gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={onClose}
            disabled={loading}
            type="button">
            Cancel
          </button>
          <button
            className="btn btn-red"
            onClick={onDelete}
            disabled={!isConfirmed || loading}
            type="button">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      }
    />
  )
}

export default DeleteProjectModal
