'use client'

import React, { useState } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import BookNow from '@src/views/Apps/event/overview/BookNow'
import EventDetails from '@src/views/Apps/event/overview/EventDetails'
import InvitationStatus from '@src/views/Apps/event/overview/InvitationStatus'
import Location from '@src/views/Apps/event/overview/Location'
import TicketSale from '@src/views/Apps/event/overview/TicketSale'
import { Pencil } from 'lucide-react'

const EventOverview: NextPageWithLayout = () => {
  const [show, setShow] = useState(false)

  const handleModal = () => {
    setShow(!show)
  }
  return (
    <React.Fragment>
      <BreadCrumb title="Overview" subTitle="Events" />
      <div className="grid grid-cols-12 gap-x-5">
        <EventDetails handleModal={handleModal} />
        <div className="col-span-12 xl:col-span-4 2xl:col-span-3">
          <button type="button" className="w-full btn btn-primary">
            <Pencil className="inline-block ltr:mr-1 rtl:ml-1 size-4" /> Edit
            Event
          </button>
          <InvitationStatus />
          <TicketSale />
          <Location />
          <BookNow show={show} closedModal={handleModal} />
        </div>
      </div>
    </React.Fragment>
  )
}

export default EventOverview
