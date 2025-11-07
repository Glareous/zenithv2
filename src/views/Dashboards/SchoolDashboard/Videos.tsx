'use client'

import React from 'react'

import Link from 'next/link'

import { NextPageWithLayout } from '@src/dtos'
import { MoveLeft, MoveRight } from 'lucide-react'

const Videos: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <div className="order-12 col-span-12 xl:col-span-8 2xl:col-span-9 card">
        <div className="card-header">
          <h6 className="card-title">
            Continue Watching{' '}
            <MoveRight className="ml-1 ltr:inline-block rtl:hidden size-4" />
            <MoveLeft className="mr-1 rtl:inline-block ltr:hidden size-4" />
          </h6>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-12 gap-space">
            <div className="col-span-12 lg:col-span-4">
              <div className="aspect-video">
                <iframe
                  className="w-full rounded-md aspect-video"
                  src="https://www.youtube.com/embed/CLkxRnRQtDE?si=8XmGYZHT5WeTmNG9"
                  title="YouTube video player"
                  frameBorder={0}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen></iframe>
              </div>
              <div className="mt-3">
                <h6 className="mb-1 truncate">
                  <Link href="#!">
                    AgenticWeb - Admin & Dashboard Template Introduction
                  </Link>
                </h6>
                <p className="text-xs text-gray-500 dark:text-dark-500">
                  TailwindCSS
                </p>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4">
              <div className="aspect-video">
                <iframe
                  className="w-full rounded-md aspect-video"
                  src="https://www.youtube.com/embed/mSC6GwizOag?si=Dqcl3RgGrfRyqmHo"
                  title="YouTube video player"
                  frameBorder={0}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen></iframe>
              </div>
              <div className="mt-3">
                <h6 className="mb-1 truncate">
                  <Link href="#!">What&apos;s new in Tailwind CSS v3.0?</Link>
                </h6>
                <p className="text-xs text-gray-500 dark:text-dark-500">
                  TailwindCSS
                </p>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4">
              <div className="aspect-video">
                <iframe
                  className="w-full rounded-md aspect-video"
                  src="https://www.youtube.com/embed/RZ9cWr3tY9w?si=J6KavpQC6n9gaC64"
                  title="YouTube video player"
                  frameBorder={0}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen></iframe>
              </div>
              <div className="mt-3">
                <h6 className="mb-1 truncate">
                  <Link href="#!">
                    Controlling Stacking Contexts with Isolation Utilities
                  </Link>
                </h6>
                <p className="text-xs text-gray-500 dark:text-dark-500">
                  TailwindCSS
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
export default Videos
