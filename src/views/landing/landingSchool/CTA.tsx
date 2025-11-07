'use client'

import React from 'react'

import Link from 'next/link'

const CTA: React.FC = () => {
  return (
    <React.Fragment>
      <section className="py-14 md:py-24 bg-primary-500" id="contact-us">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-5 leading-normal capitalize text-primary-50">
              Come join Us and Achieve your dreams Here at the best School
            </h1>
            <Link href="#!" className="rounded-full btn btn-orange">
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </React.Fragment>
  )
}

export default CTA
