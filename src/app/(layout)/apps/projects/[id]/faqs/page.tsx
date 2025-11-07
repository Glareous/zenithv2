'use client'

import React, { useEffect, useState } from 'react'

import Image from 'next/image'
import { useParams } from 'next/navigation'

import faq from '@assets/images/auth/faq.png'
import BreadCrumb from '@src/components/common/BreadCrumb'
import Accordion from '@src/components/custom/accordion/accordion'
import { faqData } from '@src/data'
import { NextPageWithLayout } from '@src/dtos'
import { api } from '@src/trpc/react'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'

import AddEditFAQModal from '../../../../../../components/molecules/AddEditFAQModal'
import DeleteModalFaq from '../../../../../../components/molecules/DeleteModalFaq'

const Faq: NextPageWithLayout = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index))
  }

  const [isClient, setIsClient] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editFaq, setEditFaq] = useState<{
    id: string
    question: string
    answer: string
  } | null>(null)
  // Obtén el projectId de la URL
  const params = useParams()
  const projectId = params.id as string

  // Cambia la query para pasar el projectId
  const { data: faqs = [], refetch } = api.projectFaq.getAll.useQuery({
    projectId,
  })

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null)

  const deleteFaq = api.projectFaq.delete.useMutation({
    onSuccess: () => {
      toast.success('FAQ deleted successfully')
      refetch()
      setDeleteModalOpen(false)
      setFaqToDelete(null)
    },
    onError: () => {
      toast.error('Error deleting FAQ')
    },
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditFaq(null)
  }

  const handleDeleteFaq = async () => {
    if (faqToDelete) {
      deleteFaq.mutate({ id: faqToDelete })
    }
  }

  return (
    <React.Fragment>
      <BreadCrumb title="FAQ's" subTitle="Pages" />

      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12">
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h6 className="text-lg font-semibold">
                Frequently asked questions (FAQ)
              </h6>
              <button
                className="btn btn-primary  max-w-40"
                onClick={() => {
                  setEditFaq(null)
                  setModalOpen(true)
                }}>
                Add FAQ
              </button>
            </div>
            <div className="card-body">
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex flex-col gap-3 w-full max-w-lg justify-between">
                  {isClient &&
                    faqs.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex gap-3 w-full justify-between ">
                        <div className="flex-1">
                          <Accordion
                            key={item.id}
                            accordionClass="accordion-boxed"
                            headerColor="accordion-primary "
                            title={item.question}
                            isOpen={openIndex === index}
                            onToggle={() => handleToggle(index)}>
                            <div className="px-3 py-2.5 ">
                              <p>{item.answer}</p>
                            </div>
                          </Accordion>
                        </div>
                        {openIndex === index && (
                          <div className="flex">
                            <div className="flex justify-start items-start gap-3">
                              <button
                                className=" bg-transparent border-none "
                                onClick={() => {
                                  setFaqToDelete(item.id)
                                  setDeleteModalOpen(true)
                                }}>
                                <Trash2 className="w-5 h-5 text-red-500" />
                              </button>
                              <button
                                className=" bg-transparent border-none "
                                onClick={() => {
                                  setEditFaq(item)
                                  setModalOpen(true)
                                }}>
                                <Pencil className="w-5 h-5 text-red-500" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddEditFAQModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSuccess={refetch}
        editFaq={editFaq}
        projectId={projectId}
      />
      <DeleteModalFaq
        show={deleteModalOpen}
        handleHide={() => setDeleteModalOpen(false)}
        handleDelete={handleDeleteFaq}
      />
    </React.Fragment>
  )
}

export default Faq
