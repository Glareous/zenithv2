import React from 'react'

import { AlertTriangle, CheckCircle, Info, Trash2, XCircle } from 'lucide-react'

import { Modal } from '../custom/modal/modal'

interface DeleteModalProps {
  show: boolean
  handleHide: () => void
  deleteModalFunction: () => void
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  type?: 'delete' | 'warning' | 'info' | 'success' | 'error'
  icon?: React.ReactNode
  className?: string
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  show,
  handleHide,
  deleteModalFunction,
  title = 'Are you sure you want to delete this?',
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'delete',
  icon,
  className,
}) => {
  const getIconAndColors = () => {
    switch (type) {
      case 'delete':
        return {
          icon: <Trash2 className="size-6" />,
          bgColor: 'bg-red-500/10',
          textColor: 'text-red-500',
          buttonClass: 'btn btn-red',
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="size-6" />,
          bgColor: 'bg-yellow-500/10',
          textColor: 'text-yellow-500',
          buttonClass: 'btn btn-yellow',
        }
      case 'info':
        return {
          icon: <Info className="size-6" />,
          bgColor: 'bg-blue-500/10',
          textColor: 'text-blue-500',
          buttonClass: 'btn btn-blue',
        }
      case 'success':
        return {
          icon: <CheckCircle className="size-6" />,
          bgColor: 'bg-green-500/10',
          textColor: 'text-green-500',
          buttonClass: 'btn btn-green',
        }
      case 'error':
        return {
          icon: <XCircle className="size-6" />,
          bgColor: 'bg-red-500/10',
          textColor: 'text-red-500',
          buttonClass: 'btn btn-red',
        }
      default:
        return {
          icon: <Trash2 className="size-6" />,
          bgColor: 'bg-red-500/10',
          textColor: 'text-red-500',
          buttonClass: 'btn btn-red',
        }
    }
  }

  const {
    icon: defaultIcon,
    bgColor,
    textColor,
    buttonClass,
  } = getIconAndColors()

  return (
    <React.Fragment>
      <Modal
        isOpen={show}
        contentClass={className}
        id="deleteModal"
        onClose={handleHide}
        position="modal-center"
        size="modal-xs"
        isFooter={true}
        content={(onClose) => (
          <>
            <div className="text-center p-7">
              <div
                className={`flex items-center justify-center mx-auto mb-4 ${textColor} rounded-full ${bgColor} size-14 backdrop-blur-xl`}>
                {icon || defaultIcon}
              </div>
              <h5 className="mb-2">{title}</h5>
              {message && (
                <p className="mb-4 text-gray-600 dark:text-gray-400 text-sm break-words">
                  {message}
                </p>
              )}
              <div className="flex items-center justify-center gap-2">
                <button
                  className={buttonClass}
                  onClick={() => {
                    deleteModalFunction()
                    onClose()
                  }}>
                  {confirmText}
                </button>
                <button className="btn btn-primary" onClick={onClose}>
                  {cancelText}
                </button>
              </div>
            </div>
          </>
        )}
      />
    </React.Fragment>
  )
}

export default DeleteModal
