import React from 'react'

import Image from 'next/image'

import welcome from '@assets/images/email/templates/welcome.png'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'

const EmailWelcome: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <BreadCrumb title="Welcome Email Template" subTitle="Templates" />

      {/* Light Mode Section */}
      <div className="mb-space">
        <div className="max-w-[550px] mx-auto border border-[#e5e7eb] rounded-md bg-white">
          <div className="text-center p-8 bg-gradient-to-tr from-purple-400 via-pink-300 to-emerald-300 rounded-t-md">
            <h4 className="text-white text-[22px] mb-2">
              Welcome to AgenticWeb
            </h4>
            <p className="text-white/80 mb-4 text-[15px]">
              Payroll, benefits, taxes & sustainability for your global team.
            </p>
            <Image src={welcome} alt="Welcome" className="mx-auto" />
          </div>
          <div className="p-8">
            <h6 className="text-[18px] mb-2 text-black">
              The Admin & Dashboards Templates use globally
            </h6>
            <p className="text-[#6b7280] text-[15px] mb-4">
              AgenticWeb is a powerful admin dashboard template built with
              Tailwind CSS. AgenticWeb comes with dozens of functional designs
              to help you get started quickly. With a wide range of beautiful
              and a full-screen layout, it&apos;s a perfect fit for admin
              dashboards, CRM, CMS panels & etc.
            </p>
            <button
              type="button"
              className="w-full block bg-[#358ffc] text-white py-2 px-6 text-sm rounded-md">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Dark Mode Section */}
      <div className="mb-space">
        <h6 className="underline my-3">Dark Mode</h6>
        <div className="max-w-[550px] mx-auto border border-[#1d293d] rounded-md bg-[#020618]">
          <div className="text-center p-8 bg-gradient-to-tr from-purple-400 via-pink-300 to-emerald-300 rounded-t-md">
            <h4 className="text-white text-[22px] mb-2">
              Welcome to AgenticWeb
            </h4>
            <p className="text-white/80 mb-4 text-[15px]">
              Payroll, benefits, taxes & sustainability for your global team.
            </p>
            <Image src={welcome} alt="Welcome Dark" className="mx-auto" />
          </div>
          <div className="p-8">
            <h6 className="text-[18px] mb-2 text-white">
              The Admin & Dashboards Templates use globally
            </h6>
            <p className="text-[#62748e] text-[15px] mb-4">
              AgenticWeb is a powerful admin dashboard template built with
              Tailwind CSS. AgenticWeb comes with dozens of functional designs
              to help you get started quickly. With a wide range of beautiful
              and a full-screen layout, it&apos;s a perfect fit for admin
              dashboards, CRM, CMS panels & etc.
            </p>
            <button
              type="button"
              className="w-full block bg-[#358ffc] text-white py-2 px-6 text-sm rounded-md">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default EmailWelcome
