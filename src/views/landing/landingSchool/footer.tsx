'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import logoWhite from '@assets/images/logo-white.png'
import mainLogo from '@assets/images/main-logo.png'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  return (
    <React.Fragment>
      <footer>
        <div className="py-14">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-6">
                <div className="max-w-lg">
                  <Link href="/" title="logo">
                    <Image
                      src={mainLogo}
                      alt="logo"
                      className="inline-block h-7 dark:hidden"
                      width={153}
                      height={28}
                    />
                    <Image
                      src={logoWhite}
                      alt="logo"
                      className="hidden h-7 dark:inline-block"
                      width={153}
                      height={28}
                    />
                  </Link>
                  <p className="mt-4 mb-6 text-gray-500 dark:text-dark-500 text-16">
                    They constitute one of the fundamental components of
                    learning, alongside objectives, methodology, and assessment.
                    knowledge, procedures, skills, attitudes, abilities, and
                    values necessary to achieve the curricular goals outlined in
                    educational.
                  </p>
                  <div className="flex items-center gap-5">
                    <Link
                      href="#!"
                      title="facebook"
                      className="relative flex items-center justify-center transition duration-300 ease-linear hover:-translate-y-1 after:absolute after:inset-0 after:rounded-lg after:-rotate-45 after:bg-primary-500/10 size-10 text-primary-500">
                      <i className="ri-facebook-fill text-[20px] relative z-10"></i>
                    </Link>
                    <Link
                      href="#!"
                      title="dribbble"
                      className="relative flex items-center justify-center text-pink-500 transition duration-300 ease-linear hover:-translate-y-1 after:absolute after:inset-0 after:rounded-lg after:-rotate-45 after:bg-pink-500/10 size-10">
                      <i className="ri-dribbble-fill text-[20px] relative z-10"></i>
                    </Link>
                    <Link
                      href="#!"
                      title="twitter"
                      className="relative flex items-center justify-center transition duration-300 ease-linear hover:-translate-y-1 text-sky-500 after:absolute after:inset-0 after:rounded-lg after:-rotate-45 after:bg-sky-500/10 size-10">
                      <i className="ri-twitter-line text-[20px] relative z-10"></i>
                    </Link>
                    <Link
                      href="#!"
                      title="youtube"
                      className="relative flex items-center justify-center text-red-500 transition duration-300 ease-linear hover:-translate-y-1 after:absolute after:inset-0 after:rounded-lg after:-rotate-45 after:bg-red-500/10 size-10">
                      <i className="ri-youtube-line relative z-10 text-[20px]"></i>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-span-12 sm:col-span-4 md:col-span-2">
                <h6 className="mb-4 text-17">About Us</h6>
                <ul className="flex flex-col gap-5 text-16">
                  <li>
                    <Link href="#!" className="link link-orange">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="#!" className="link link-orange">
                      NewsLatter
                    </Link>
                  </li>
                  <li>
                    <Link href="#!" className="link link-orange">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="#!" className="link link-orange">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link href="#!" className="link link-orange">
                      Dashboards
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="col-span-12 sm:col-span-4 md:col-span-2">
                <h6 className="mb-4 text-17">Students</h6>
                <ul className="flex flex-col gap-5 text-16">
                  <li>
                    <Link href="#!" className="link link-orange">
                      List View
                    </Link>
                  </li>
                  <li>
                    <Link href="#!" className="link link-orange">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="#!" className="link link-orange">
                      Attendance
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="col-span-12 sm:col-span-4 md:col-span-2">
                <h6 className="mb-4 text-17">Our Support</h6>
                <ul className="flex flex-col gap-5 text-16">
                  <li>
                    <Link href="#!" className="link link-orange">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="#!" className="link link-orange">
                      Account
                    </Link>
                  </li>
                  <li>
                    <Link href="#!" className="link link-orange">
                      Feedback
                    </Link>
                  </li>
                  <li>
                    <Link href="#!" className="link link-orange">
                      Licenses
                    </Link>
                  </li>
                  <li>
                    <Link href="#!" className="link link-orange">
                      FAQ&apos;s
                    </Link>
                  </li>
                  <li>
                    <Link href="#!" className="link link-orange">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4">
          <div className="py-6 text-center text-gray-500 border-t border-gray-200 border-dashed dark:text-dark-500 dark:border-dark-800 text-16">
            <p>
              &copy; <span>{currentYear}</span> Zenith. Crafted & Design by
              <Link href="#!" className="ml-1 font-semibold link link-orange">
                Cognitiva IA
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </React.Fragment>
  )
}

export default Footer
