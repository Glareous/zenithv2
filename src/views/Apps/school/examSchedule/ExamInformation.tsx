'use client'

import React, { useEffect, useState } from 'react'

import Link from 'next/link'

import UseNumberCounter from '@src/components/common/NumberCounter'
import { examInformation } from '@src/data'
import {
  Blend,
  BookOpenText,
  LibraryBig,
  NotebookText,
  NotepadTextDashed,
  Video,
} from 'lucide-react'

const ExamInformation = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [percent] = useState(34) // The progress percentage
  const [progress, setProgress] = useState(100) // Initial dash offset
  useEffect(() => {
    // Simulate the progress animation
    const animateProgress = () => {
      const strokeDashOffset = 100 - percent // Calculate dash offset based on percentage
      setProgress(strokeDashOffset)
    }

    animateProgress()
  }, [percent])

  const getLucideIcon = (icon: string, className: string) => {
    const icons: { [key: string]: React.ReactElement } = {
      'book-open-text': <BookOpenText className={className} />,
      'library-big': <LibraryBig className={className} />,
      'notepad-text-dashed': <NotepadTextDashed className={className} />,
      'notebook-text': <NotebookText className={className} />,
      video: <Video className={className} />,
      blend: <Blend className={className} />,
    }
    return icons[icon]
  }

  return (
    <React.Fragment>
      {isOpen && (
        <div className="font-medium text-center ltr:pr-10 rtl:pl-10 alert alert-primary mb-space">
          <span>Today Test: 2 Test and online 1 Test</span>
          <Link
            href="#"
            onClick={() => setIsOpen(false)} // Handle close functionality
            className="absolute text-lg transition duration-200 ease-linear text-primary-400 hover:text-primary-500 ltr:right-5 rtl:left-5 top-2">
            <i className="ri-close-fill"></i>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 row-span-2 sm:col-span-6 xl:col-span-3 card">
          <div className="card-body">
            <h6 className="mb-5">Total Exam (This month)</h6>
            <div className="relative mx-auto size-36" dir="ltr">
              <svg
                className="size-full"
                width="36"
                height="36"
                viewBox="0 0 36 36"
                xmlns="http://www.w3.org/2000/svg">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-current text-sky-500/10"
                  strokeWidth="3"
                />
                <g className="origin-center transform -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-current text-sky-500"
                    strokeWidth="3"
                    strokeDasharray="100"
                    strokeDashoffset={progress}
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </g>
              </svg>
              <div className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 start-1/2">
                <span className="text-lg font-bold text-center text-gray-800 dark:text-dark-50">
                  {`${percent}%`}
                </span>
              </div>
            </div>
          </div>
        </div>
        {examInformation.map((exam, index) => (
          <div
            key={index}
            className="relative col-span-12 sm:col-span-6 xl:col-span-3 card">
            <div className="card-body">
              <div
                className={`absolute top-5 ltr:right-5 rtl:left-5 ${exam.icon.color} ${exam.icon.backgroundColor} size-6`}>
                {getLucideIcon(exam.icon.name, 'w-6 h-6')}
              </div>
              <p className={`mb-3 ${exam.textColor} ${exam.backgroundColor}`}>
                {exam.testType}
              </p>
              <h5>
                <UseNumberCounter start={1} end={exam.count} duration={3000} />
              </h5>
            </div>
          </div>
        ))}
      </div>
    </React.Fragment>
  )
}

export default ExamInformation
