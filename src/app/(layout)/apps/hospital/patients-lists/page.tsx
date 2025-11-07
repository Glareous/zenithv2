'use client'

import React, { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { NextPageWithLayout, Patients } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import {
  deletePatientsData,
  getPatientsData,
  modifyCurrentPatients,
} from '@src/slices/thunk'
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import FilterDrawer from './FilterDrawer'
import OverviewModal from './OverviewModal'

const PatientsLists: NextPageWithLayout = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { patients } = useSelector((state: RootState) => state.Patients)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )

  const [filteredPatients, setFilteredPatients] = useState<Patients[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patients | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage] = useState<number>(16)
  const rouder = useRouter()

  useEffect(() => {
    if (!patients) {
      dispatch(getPatientsData())
    } else {
      setFilteredPatients(patients)
    }
  }, [patients, dispatch])

  const toggleDeleteModal = () => {
    setShowDeleteModal(!showDeleteModal)
  }

  const onClickEventListDelete = (patient: Patients) => {
    setSelectedPatient(patient)
    toggleDeleteModal()
  }

  const handleDeletePatients = () => {
    if (selectedPatient) {
      dispatch(deletePatientsData([selectedPatient.id]))
      toggleDeleteModal()
    }
  }

  const onClickOverview = (patient: Patients) => {
    setSelectedPatient(patient)
    setIsModalOpen(true)
  }

  const handleHide = () => {
    setIsModalOpen(false)
    setSelectedPatient(null)
  }

  const openDrawer = () => setDrawerOpen(true)
  const closeDrawer = () => setDrawerOpen(false)

  const applyFilters = (filters: {
    doctor?: string
    status?: string
    insurance?: string
    city?: string
    gender?: string
  }) => {
    let updatedPatients = [...patients]

    if (filters.doctor) {
      updatedPatients = updatedPatients.filter(
        (patient) => patient.doctorName === filters.doctor
      )
    }
    if (filters.status) {
      updatedPatients = updatedPatients.filter(
        (patient) => patient.status === filters.status
      )
    }
    if (filters.insurance) {
      updatedPatients = updatedPatients.filter(
        (patient) => patient.insurance === filters.insurance
      )
    }
    if (filters.city) {
      updatedPatients = updatedPatients.filter(
        (patient) => patient.location === filters.city
      )
    }
    if (filters.gender) {
      updatedPatients = updatedPatients.filter(
        (patient) => patient.gender === filters.gender
      )
    }

    setFilteredPatients(updatedPatients)
    setCurrentPage(1)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)

    const filtered = patients.filter(
      (patient: Patients) =>
        `${patient.first_name} ${patient.last_name}`
          .toLowerCase()
          .includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.phoneNumber.includes(query)
    )

    setFilteredPatients(filtered)
    setCurrentPage(1)
  }

  // Pagination
  const indexOfLastPatient = currentPage * itemsPerPage
  const indexOfFirstPatient = indexOfLastPatient - itemsPerPage
  const currentPatients = filteredPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  )
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleEdit = (data: Patients) => {
    dispatch(modifyCurrentPatients(data, true))
    rouder.push('/apps/hospital/patients-create')
  }

  return (
    <React.Fragment>
      <BreadCrumb title="List View" subTitle="Patients" />
      <div className="justify-between sm:flex">
        <div>
          <div className="relative group/form">
            <input
              type="text"
              className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
              placeholder="Search for patients..."
              value={searchQuery}
              onChange={handleSearch}
            />
            <div className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden">
              <Search className="size-4" />
            </div>
          </div>
        </div>
        <div>
          <div className="flex flex-wrap items-center justify-end gap-2 mt-2 sm:mt-0">
            <button
              type="button"
              className="btn btn-sub-gray"
              onClick={openDrawer}>
              <SlidersHorizontal className="inline-block ltr:mr-1 rtl:ml-1 size-4" />{' '}
              Filters
            </button>
            <Link
              href="/apps/hospital/patients-create"
              className="btn btn-primary">
              <CirclePlus className="inline-block ltr:mr-1 rtl:ml-1 size-4" />{' '}
              Add Patient
            </Link>
          </div>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-x-space mt-space">
          {currentPatients.length > 0 ? (
            currentPatients.map((patient, index) => (
              <div key={index} className="relative card">
                <div className="card-body">
                  <Dropdown
                    trigger="click"
                    dropdownClassName="dropdown dropdown-right ltr:float-right rtl:float-lef">
                    <DropdownButton colorClass="flex items-center text-gray-500">
                      <i className="ri-more-fill"></i>
                    </DropdownButton>
                    <DropdownMenu>
                      <Link
                        href="#!"
                        className="dropdown-item"
                        onClick={(e) => {
                          e.preventDefault()
                          onClickOverview(patient)
                        }}>
                        <i className="align-middle ltr:mr-2 rtl:ml-2 ri-eye-line"></i>{' '}
                        Overview
                      </Link>
                      <button
                        className="dropdown-item"
                        onClick={() => handleEdit(patient)}>
                        <i className="align-middle ltr:mr-2 rtl:ml-2 ri-pencil-line"></i>{' '}
                        Edit
                      </button>
                      <Link
                        href="#!"
                        className="dropdown-item"
                        onClick={(e) => {
                          e.preventDefault()
                          onClickEventListDelete(patient)
                        }}>
                        <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>{' '}
                        Delete
                      </Link>
                    </DropdownMenu>
                  </Dropdown>
                  <div className="flex items-center gap-3">
                    <Image
                      src={patient.image}
                      alt="patientImg"
                      className="rounded-md size-20 shrink-0"
                      height={80}
                      width={80}
                    />
                    <div className="grow">
                      <h6 className="mb-1.5">
                        {patient.first_name} {patient.last_name}
                      </h6>
                      <p className="mb-1 text-gray-500">
                        <i className="ltr:mr-1 rtl:ml-1 ri-mail-line"></i>{' '}
                        {patient.email}
                      </p>
                      <p className="text-gray-500">
                        <i className="ltr:mr-1 rtl:ml-1 ri-phone-line"></i>{' '}
                        {patient.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-12 p-8">
              <p className="mt-2 text-center text-gray-500">
                No matching records found
              </p>
            </div>
          )}
        </div>

        {currentPatients.length > 0 && (
          <div className="grid grid-cols-12 gap-5 mb-5">
            <div className="col-span-12 md:col-span-6">
              <p className="text-gray-500">
                Showing <b>{indexOfFirstPatient + 1}</b> -
                <b>{Math.min(indexOfLastPatient, filteredPatients.length)}</b>{' '}
                of
                <b>{filteredPatients.length}</b> Results
              </p>
            </div>
            <div className="col-span-12 md:col-span-6">
              <div className="flex justify-end pagination pagination-primary">
                <button
                  className="pagination-pre"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}>
                  <ChevronLeft className="mr-1 size-4" /> Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`pagination-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    {i + 1}
                  </button>
                ))}
                <button
                  className="pagination-next"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}>
                  Next <ChevronRight className="ml-1 size-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />
      <DeleteModal
        show={showDeleteModal}
        handleHide={toggleDeleteModal}
        deleteModalFunction={handleDeletePatients}
      />
      {selectedPatient && (
        <OverviewModal
          show={isModalOpen}
          handleHide={handleHide}
          patient={{
            ...selectedPatient,
            id: selectedPatient?.id.toString(),
            name: `${selectedPatient?.first_name} ${selectedPatient?.last_name}`,
            insurance: selectedPatient?.insurance === 'true',
          }}
        />
      )}
      <FilterDrawer
        isDrawerOpen={isDrawerOpen}
        closeDrawer={closeDrawer}
        onFilterChange={applyFilters}
      />
    </React.Fragment>
  )
}

export default PatientsLists
