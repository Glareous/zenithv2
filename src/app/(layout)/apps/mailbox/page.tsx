'use client'

import React, { useEffect, useState } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import { Email, NextPageWithLayout } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import {
  deleteMailData,
  getMailData,
  setCurrentEmailRecordData,
} from '@src/slices/thunk'
import AddComposeModal from '@src/views/Apps/Mailbox/AddComposeModal'
import MailSection from '@src/views/Apps/Mailbox/MailSection'
import SideMail from '@src/views/Apps/Mailbox/SideMail'
import SliderBrand from '@src/views/Apps/Mailbox/SliderBrand'
import { Menu } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { createSelector } from 'reselect'

const MailBox: NextPageWithLayout = () => {
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )

  const [show, setShow] = useState(false)
  const [isOpenComposeModal, setIsOpenComposeModal] = useState(false)
  const [, setIsMobileView] = useState<boolean>(false)
  const [isSideMail, setIsSideMail] = useState<boolean>(true)
  const { currentEmail } = useSelector((state: RootState) => state.Mail)
  const [mobileView, setMobileView] = useState<boolean>(false)
  const [isShowInMobile, setIsShowInMobile] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setMobileView(window.innerWidth <= 1024)
      }

      // Add event listener for window resize
      window.addEventListener('resize', handleResize)

      // Initial check on component mount
      handleResize()

      // Cleanup event listener on component unmount
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [show])

  useEffect(() => {
    if (show) {
      setIsShowInMobile(false)
    } else {
      setIsShowInMobile(true)
    }
  }, [show])

  const handleShowMail = (id: number) => {
    const email = mailList.find((mail) => mail.id === id) || null
    if (email) {
      dispatch(setCurrentEmailRecordData(email))
    }
    setShow(!!email) // Show or hide the MailSection based on email selection
  }

  const handleComposeModal = () => {
    setIsOpenComposeModal(!isOpenComposeModal)
  }

  // get data
  const dispatch: AppDispatch = useDispatch()

  const mailDatas = createSelector(
    (state: RootState) => state.Mail,
    (mail) => mail.mail
  )
  const mail = useSelector(mailDatas)

  const [mailList, setMailList] = useState<Email[]>([])

  const [email, setEmail] = useState<Email | null>(null)

  const [deleteShow, setDeleteShow] = useState<boolean>(false)
  const toggleDelete = () => {
    setDeleteShow(false)
    setEmail(null)
  }

  const onClickEmailDelete = (mail: Email) => {
    setEmail(mail)
    setDeleteShow(true)
  }

  const handleDeleteEmail = () => {
    if (email) {
      // Get the index of the email being deleted
      const currentIndex = mailList.findIndex((m) => m.id === email.id)

      // Dispatch action to delete the email

      // Update mailList to remove the deleted email
      const updatedMailList = mailList.filter((m) => m.id !== email.id)
      setMailList(updatedMailList)

      // Determine the next email to show
      const nextIndex =
        currentIndex < updatedMailList.length ? currentIndex : currentIndex - 1
      const nextEmail = updatedMailList[nextIndex] || null

      dispatch(deleteMailData([email.id]))
      dispatch(setCurrentEmailRecordData(nextEmail))

      // Set the new email to display
      // setSelectedMail(nextEmail);
      setShow(!!nextEmail) // Show or hide MailSection based on next email
      setDeleteShow(false)
      setEmail(null)
    }
  }
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([])
  const [activeType, setActiveType] = useState<string>('all')

  // use effect for get checkout shop cart data
  useEffect(() => {
    if (!mail) {
      dispatch(getMailData())
    } else {
      setMailList(mail)
      setFilteredEmails(mail)
    }
  }, [mail, dispatch])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        const mobileWidth = window.innerWidth <= 1024
        setIsMobileView(mobileWidth)

        // Reset to chat list on small screens when switching from larger screens
        if (mobileWidth) {
          setShow(false)
          setIsSideMail(false)
        }
      }

      // Add event listener for window resize
      window.addEventListener('resize', handleResize)

      // Initial check on component mount
      handleResize()

      // Cleanup event listener on component unmount
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  const toggleSidemail = () => {
    setIsSideMail(!isSideMail)
  }

  // filter data
  const filterEmails = (type: string, badge?: string) => {
    let newFilteredEmails = mailList

    // set active type
    if (!badge) {
      setActiveType(type)
    } else {
      setActiveType(badge ? badge : 'all')
    }

    if (type !== 'all') {
      newFilteredEmails = newFilteredEmails.filter(
        (email) => email.type === type
      )
    }

    if (badge) {
      newFilteredEmails = newFilteredEmails.filter((email) =>
        email.badges.includes(badge)
      )
    }

    setFilteredEmails(newFilteredEmails)
  }

  const getBadgeCount = (type: string) => {
    return mailList.filter((email) => email.type === type).length
  }

  if (!mailList.length) {
    return <div>No emails available</div>
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Mailbox" subTitle="Apps" />
      <div className="flex flex-col xl:flex-row">
        <div className="mb-space xl:hidden">
          <button className="btn btn-primary" onClick={() => toggleSidemail()}>
            <Menu className="inline-block ltr:mr-1 rtl:ml-1 size-4"></Menu> Menu
          </button>
        </div>
        {/* side */}
        {isSideMail == true && (
          <SideMail
            filterEmails={filterEmails}
            activeType={activeType}
            getBadgeCount={getBadgeCount}
            handleComposeModal={handleComposeModal}
          />
        )}
        {mobileView && isShowInMobile === true ? (
          <>
            <SliderBrand
              show={show}
              handleShowMail={handleShowMail}
              filteredEmails={filteredEmails.map((email) => ({
                ...email,
                avatarImage:
                  typeof email.avatarImage === 'string'
                    ? email.avatarImage
                    : undefined,
              }))}
            />
          </>
        ) : (
          <>
            {mobileView === true && (
              <MailSection
                show={show}
                handleShowMail={() => handleShowMail(0)}
                mail={currentEmail}
                filteredEmails={filteredEmails}
                onClickEmailDelete={onClickEmailDelete}
              />
            )}
          </>
        )}
        {mobileView == false && (
          <>
            <SliderBrand
              show={show}
              handleShowMail={handleShowMail}
              filteredEmails={filteredEmails}
            />

            {/* mail section */}
            <MailSection
              show={show}
              handleShowMail={() => handleShowMail(0)}
              mail={currentEmail}
              filteredEmails={filteredEmails}
              onClickEmailDelete={onClickEmailDelete}
            />
          </>
        )}

        <DeleteModal
          show={deleteShow}
          handleHide={toggleDelete}
          deleteModalFunction={handleDeleteEmail}
        />
      </div>

      <AddComposeModal
        isModalOpen={isOpenComposeModal}
        onClose={() => handleComposeModal()}
        mailList={mailList}
      />

      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />
    </React.Fragment>
  )
}

export default MailBox
