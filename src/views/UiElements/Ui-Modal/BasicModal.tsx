'use client'

import React, { useState } from 'react'

import { Modal } from '@src/components/custom/modal/modal'

const BasicModal: React.FC = () => {
  const [modalState, setModalState] = useState<{ [key: string]: boolean }>({
    center: false,
    top: false,
    topLeft: false,
    topRight: false,
    bottomLeft: false,
    bottomRight: false,
    left: false,
    right: false,
    extraSmall: false,
    small: false,
    medium: false,
    large: false,
    extraLarge: false,
    extraExtraLarge: false,
  })

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  return (
    <React.Fragment>
      <div>
        <button onClick={() => openModal('center')} className="btn btn-primary">
          Default Modal
        </button>

        {/* Modals */}
        <Modal
          isOpen={modalState.center}
          onClose={() => closeModal('center')}
          position="modal-center"
          title="Center Modal"
          content={
            <>
              <h6 className="mb-3">Modal Content</h6>
              <p className="text-gray-500 dark:text-dark-500">
                They all have something to say beyond the words on the page.
                They can come across as casual or neutral, exotic or graphic.
              </p>
            </>
          }
          footer={
            <div>
              <h6>Modal Footer</h6>
            </div>
          }
        />
      </div>
    </React.Fragment>
  )
}

export default BasicModal
