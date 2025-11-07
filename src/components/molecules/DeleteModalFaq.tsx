import React from 'react'

import { Modal } from '@src/components/custom/modal/modal'
import { Trash2 } from 'lucide-react'

interface DeleteModalFaqProps {
  show: boolean
  handleHide: () => void
  handleDelete: () => void
}

const DeleteModalFaq: React.FC<DeleteModalFaqProps> = ({
  show,
  handleHide,
  handleDelete,
}) => {
  return (
    <React.Fragment>
      <Modal
        isOpen={show}
        id="deleteModal"
        onClose={handleHide}
        position="modal-center"
        size="modal-xs"
        isFooter={true}
        content={(onClose) => (
          <>
            <div className="text-center p-7">
              <div className="flex items-center justify-center mx-auto mb-4 text-red-500 rounded-full bg-red-500/10 size-14 backdrop-blur-xl">
                <Trash2 className="size-6" />
              </div>
              <h5 className="mb-4">
                Are you sure you want to delete this FAQ?
              </h5>
              <div className="flex items-center justify-center gap-2">
                <button
                  className="btn btn-red"
                  onClick={() => {
                    handleDelete()
                    onClose()
                  }}>
                  Delete
                </button>
                <button className="btn btn-active-primary" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}
      />
    </React.Fragment>
  )
}

export default DeleteModalFaq
