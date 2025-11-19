'use client'

import React from 'react'

import Link from 'next/link'

import { api } from '@src/trpc/react'
import { useSession } from 'next-auth/react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const { status, data: session } = useSession()

  // Use the same query as the Layout to get organization with logoUrl
  const { data: userOrganization } = api.organization.getUserOrganization.useQuery(
    undefined,
    {
      enabled: status === 'authenticated' && session?.user?.role !== 'SUPERADMIN',
    }
  )

  return (
    <React.Fragment>
      <footer className="pb-8 pt-36 bg-slate-50 dark:bg-dark-900/30">
        <div className="container mx-auto px-4 xl:px-20">
          <div className="grid grid-cols-12 gap-space">
            <div className="col-span-12 xl:col-span-4">
              {userOrganization?.logoUrl && (
                <Link href="/apps/pqr/pqr-list" title="logo">
                  <img
                    src={userOrganization.logoUrl}
                    alt={userOrganization.name}
                    className="inline-block h-16 object-contain"
                  />
                </Link>
              )}
              <p className="mb-5 text-gray-500 dark:text-dark-500 mt-7 text-16">
                We help your business!
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="#!"
                  title="facebook"
                  className="inline-flex items-center justify-center bg-white rounded-lg shadow-lg dark:bg-dark-900 shadow-slate-200 dark:shadow-dark-850 size-12 link link-primary">
                  <i className="ri-facebook-fill text-[20px]"></i>
                </Link>
                {/* <Link
                  href="#!"
                  title="twitch"
                  className="inline-flex items-center justify-center bg-white rounded-lg shadow-lg dark:bg-dark-900 shadow-slate-200 dark:shadow-dark-850 size-12 link link-purple">
                  <i className="ri-twitch-line text-[20px]"></i>
                </Link> */}
                <Link
                  href="#!"
                  title="twitter"
                  className="inline-flex items-center justify-center bg-white rounded-lg shadow-lg dark:bg-dark-900 shadow-slate-200 dark:shadow-dark-850 size-12 link link-sky">
                  <i className="ri-twitter-line text-[20px]"></i>
                </Link>
                <Link
                  href="#!"
                  title="instagram"
                  className="inline-flex items-center justify-center bg-white rounded-lg shadow-lg dark:bg-dark-900 shadow-slate-200 dark:shadow-dark-850 size-12 link link-pink">
                  <i className="ri-instagram-line text-[20px]"></i>
                </Link>
              </div>
            </div>
            {/* <div className="col-span-12 sm:col-span-4 xl:col-span-2 xl:col-start-7">
              <h6 className="text-16">Product Pages</h6>
              <ul className="mt-8 flex flex-col gap-5 text-16">
                <li>
                  <Link
                    href="#!"
                    className="relative inline-block link link-sky before:absolute before:bg-sky-500 before:h-[1px] before:bottom-0 before:transition-all before:duration-300 before:w-0 hover:before:w-full">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#!"
                    className="relative inline-block link link-sky before:absolute before:bg-sky-500 before:h-[1px] before:bottom-0 before:transition-all before:duration-300 before:w-0 hover:before:w-full">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#!"
                    className="relative inline-block link link-sky before:absolute before:bg-sky-500 before:h-[1px] before:bottom-0 before:transition-all before:duration-300 before:w-0 hover:before:w-full">
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="#!"
                    className="relative inline-block link link-sky before:absolute before:bg-sky-500 before:h-[1px] before:bottom-0 before:transition-all before:duration-300 before:w-0 hover:before:w-full">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#!"
                    className="relative inline-block link link-sky before:absolute before:bg-sky-500 before:h-[1px] before:bottom-0 before:transition-all before:duration-300 before:w-0 hover:before:w-full">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#!"
                    className="relative inline-block link link-sky before:absolute before:bg-sky-500 before:h-[1px] before:bottom-0 before:transition-all before:duration-300 before:w-0 hover:before:w-full">
                    Contacts Us
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-12 sm:col-span-4 xl:col-span-2">
              <h6 className="text-16">Links</h6>
              <ul className="mt-8 flex flex-col gap-5 text-16">
                <li>
                  <Link
                    href="#!"
                    className="relative inline-block link link-sky before:absolute before:bg-sky-500 before:h-[1px] before:bottom-0 before:transition-all before:duration-300 before:w-0 hover:before:w-full">
                    Insta by Zenith
                  </Link>
                </li>
                <li>
                  <Link
                    href="#!"
                    className="relative inline-block link link-sky before:absolute before:bg-sky-500 before:h-[1px] before:bottom-0 before:transition-all before:duration-300 before:w-0 hover:before:w-full">
                    Zenith Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="#!"
                    className="relative inline-block link link-sky before:absolute before:bg-sky-500 before:h-[1px] before:bottom-0 before:transition-all before:duration-300 before:w-0 hover:before:w-full">
                    Zenith Reach
                  </Link>
                </li>
                <li>
                  <Link
                    href="#!"
                    className="relative inline-block link link-sky before:absolute before:bg-sky-500 before:h-[1px] before:bottom-0 before:transition-all before:duration-300 before:w-0 hover:before:w-full">
                    Zenith Drive
                  </Link>
                </li>
                <li>
                  <Link
                    href="#!"
                    className="relative inline-block link link-sky before:absolute before:bg-sky-500 before:h-[1px] before:bottom-0 before:transition-all before:duration-300 before:w-0 hover:before:w-full">
                    Zenith Bot
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-12 sm:col-span-4 xl:col-span-2">
              <h6 className="text-16">More Pages</h6>
              <ul className="mt-8 flex flex-col gap-5 text-16">
                <li>
                  <Link
                    href="#!"
                    className="relative inline-block link link-sky before:absolute before:bg-sky-500 before:h-[1px] before:bottom-0 before:transition-all before:duration-300 before:w-0 hover:before:w-full">
                    Video Tutorial
                  </Link>
                </li>
                <li>
                  <Link
                    href="#!"
                    className="relative inline-block link link-sky before:absolute before:bg-sky-500 before:h-[1px] before:bottom-0 before:transition-all before:duration-300 before:w-0 hover:before:w-full">
                    Partnership
                  </Link>
                </li>
                <li>
                  <Link
                    href="#!"
                    className="relative inline-block link link-sky before:absolute before:bg-sky-500 before:h-[1px] before:bottom-0 before:transition-all before:duration-300 before:w-0 hover:before:w-full">
                    Cookie Setting
                  </Link>
                </li>
                <li>
                  <Link
                    href="#!"
                    className="relative inline-block link link-sky before:absolute before:bg-sky-500 before:h-[1px] before:bottom-0 before:transition-all before:duration-300 before:w-0 hover:before:w-full">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#!"
                    className="relative inline-block link link-sky before:absolute before:bg-sky-500 before:h-[1px] before:bottom-0 before:transition-all before:duration-300 before:w-0 hover:before:w-full">
                    Healthcare Directory
                  </Link>
                </li>
              </ul>
            </div> */}
          </div>
        </div>
        <div className="container mx-auto mt-12 text-center xl:px-20">
          {/* <p className="text-gray-500 dark:text-dark-500 text-16">
            &copy; <span>{currentYear}</span> Zenith. Crafted & Design by
            <Link href="#!" className="ml-1 font-semibold link link-sky">
              Cognitiva IA
            </Link>
          </p> */}
        </div>
      </footer>
    </React.Fragment>
  )
}

export default Footer
