'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import whiteLogo from '@assets/images/logo-white.png'
import mainLogo from '@assets/images/main-logo.png'

const Header: React.FC = () => {
  const [isSticky, setIsSticky] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`landing-navbar h-20 top-10 [&.scroll-sticky]:top-0 [&.scroll-sticky]:shadow-gray-200/50 [&.scroll-sticky]:shadow-lg [&.scroll-sticky]:bg-white dark:[&.scroll-sticky]:shadow-dark-850 dark:[&.scroll-sticky]:bg-dark-900 ${isSticky ? 'scroll-sticky' : ''}`}>
      <div className="container mx-auto px-4 flex items-center">
        <Link href="/" passHref title="Logo">
          <Image
            src={mainLogo}
            alt="Main Logo"
            className="inline-block h-7 dark:hidden"
            width={153}
            height={40}
          />
          <Image
            src={whiteLogo}
            alt="White Logo"
            className="hidden h-7 dark:inline-block"
            width={153}
            height={40}
          />
        </Link>
        <div
          className={`mx-auto navbar-collapase hidden xl:flex ${
            !isMenuOpen ? 'hidden xl:flex' : ''
          }`}>
          <div className="flex flex-col xl:flex-row xl:items-center *:py-3 xl:py-0 xl:*:px-3 *:inline-block *:text-16 *:tracking-wide *:font-medium">
            <Link
              href="#home"
              onClick={() => setActiveTab(1)}
              className={`leading-normal [&.active]:text-orange-500 hover:text-orange-500 transition duration-300 ease-linear ${
                activeTab === 1 ? 'active' : 'hover:text-orange-500'
              } transition duration-300 ease-linear`}>
              Home
            </Link>
            <Link
              href="#about-us"
              passHref
              onClick={() => setActiveTab(2)}
              className={`leading-normal [&.active]:text-orange-500 hover:text-orange-500 transition duration-300 ease-linear ${
                activeTab === 2 ? 'active' : 'hover:text-orange-500'
              } transition duration-300 ease-linear`}>
              About Us
            </Link>
            <Link
              href="#courses"
              passHref
              onClick={() => setActiveTab(3)}
              className={`leading-normal [&.active]:text-orange-500 hover:text-orange-500 transition duration-300 ease-linear ${
                activeTab === 3 ? 'active' : 'hover:text-orange-500'
              } transition duration-300 ease-linear`}>
              Courses
            </Link>
            <Link
              href="#mentors"
              passHref
              onClick={() => setActiveTab(4)}
              className={`leading-normal [&.active]:text-orange-500 hover:text-orange-500 transition duration-300 ease-linear ${
                activeTab === 4 ? 'active' : 'hover:text-orange-500'
              } transition duration-300 ease-linear`}>
              Mentors
            </Link>
            <Link
              href="#blogs"
              passHref
              onClick={() => setActiveTab(5)}
              className={`leading-normal [&.active]:text-orange-500 hover:text-orange-500 transition duration-300 ease-linear ${
                activeTab === 5 ? 'active' : 'hover:text-orange-500'
              } transition duration-300 ease-linear`}>
              Blogs
            </Link>
            <Link
              href="#contact-us"
              passHref
              onClick={() => setActiveTab(6)}
              className={`leading-normal [&.active]:text-orange-500 hover:text-orange-500 transition duration-300 ease-linear ${
                activeTab === 6 ? 'active' : 'hover:text-orange-500'
              } transition duration-300 ease-linear`}>
              Contact Us
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2 ltr:ml-auto rtl:mr-auto">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
            title="menu toggle"
            className="rounded-full xl:ltr:ml-0 xl:rtl:mr-0 ltr:ml-auto rtl:mr-auto navbar-toggle btn btn-sub-sky btn-icon xl:!hidden">
            <i
              className={`text-lg ${isMenuOpen ? 'ri-close-line' : 'ri-menu-2-line'}`}
            />
          </button>
          <button type="button" className="py-3 min-w-40 btn btn-orange">
            Enroll Now
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
