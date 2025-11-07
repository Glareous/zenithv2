'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import user25 from '@assets/images/avatar/user-25.png'
import user26 from '@assets/images/avatar/user-26.png'
import user27 from '@assets/images/avatar/user-27.png'
import user28 from '@assets/images/avatar/user-28.png'
import user29 from '@assets/images/avatar/user-29.png'
import user30 from '@assets/images/avatar/user-30.png'
import { MoveLeft, MoveRight } from 'lucide-react'

const TreatmentData = [
  {
    image: user25,
    doctorName: 'Dr. Mariana Grandon',
    degree: 'Endocrinologist',
    TreatmentNumber: '2154',
    borderClass: 'border-b border-r',
  },
  {
    image: user26,
    doctorName: 'Dr. Sydney Toor',
    degree: 'Hematology',
    TreatmentNumber: '879',
    borderClass: 'border-b',
  },
  {
    image: user27,
    doctorName: 'Dr. Dante Ditto',
    degree: 'Radiologist',
    TreatmentNumber: '643',
    borderClass: 'border-b border-r',
  },
  {
    image: user28,
    doctorName: 'Dr. Marcus Welton',
    degree: 'Nephrologist',
    TreatmentNumber: '5412',
    borderClass: ' border-b',
  },
  {
    image: user29,
    doctorName: 'Dr. Jennifer Maune',
    degree: 'Cardiologist',
    TreatmentNumber: '1874',
    borderClass: 'border-r',
  },
  {
    image: user30,
    doctorName: 'Dr. Antonio Ligler',
    degree: 'Neurologists',
    TreatmentNumber: '1195',
    borderClass: '',
  },
]

const SummaryTreatment = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 lg:col-span-6 xl:col-span-4 card">
        <div className="flex items-center gap-3 card-header">
          <h6 className="card-title grow">Treatment Summaries</h6>
          <Link
            href="#!"
            className="text-primary-500 link hover:text-primary-600">
            See All
            <MoveRight className="ml-1 ltr:inline-block rtl:hidden size-4" />
            <MoveLeft className="mr-1 rtl:inline-block ltr:hidden size-4" />
          </Link>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-12">
            {TreatmentData.map((item, index) => {
              return (
                <div
                  key={index}
                  className={`col-span-6 p-4 ${item.borderClass} border-gray-200 border-dashed dark:border-dark-800`}>
                  <div className="flex gap-2">
                    <Image
                      src={item.image}
                      alt="userImg"
                      className="rounded-md size-10 shrink-0"
                    />
                    <div className="overflow-hidden grow">
                      <h6 className="truncate">{item.doctorName}</h6>
                      <p className="text-gray-500 dark:text-dark-500">
                        {item.degree}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-500 dark:text-dark-500">
                    {item.TreatmentNumber} Treatment
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
export default SummaryTreatment
