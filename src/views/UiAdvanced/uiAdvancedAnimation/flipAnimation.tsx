'use client'

import React, { useEffect } from 'react'

import AOS from 'aos'
import 'aos/dist/aos.css'

const FlipAnimation = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000, // Duration of animations
      once: true, // Whether animations should happen only once
    })
  }, [])
  return (
    <React.Fragment>
      <h5 className="mb-5 underline">Flip Animation:</h5>
      <div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-x-space">
        <div className="card">
          <div className="card-body">
            <div
              className="mx-auto size-56 sm:size-64 md:size-80 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-sky-500/20"
              data-aos="flip-left"></div>
            <div className="mt-3 text-center">
              <code className="text-pink-500">
                data-aos=&quot;flip-left&quot;
              </code>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div
              className="mx-auto size-56 sm:size-64 md:size-80 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-sky-500/20"
              data-aos="flip-right"></div>
            <div className="mt-3 text-center">
              <code className="text-pink-500">
                data-aos=&quot;flip-right&quot;
              </code>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div
              className="mx-auto size-56 sm:size-64 md:size-80 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-sky-500/20"
              data-aos="flip-up"></div>
            <div className="mt-3 text-center">
              <code className="text-pink-500">
                data-aos=&quot;flip-up&quot;
              </code>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div
              className="mx-auto size-56 sm:size-64 md:size-80 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-sky-500/20"
              data-aos="flip-down"></div>
            <div className="mt-3 text-center">
              <code className="text-pink-500">
                data-aos=&quot;flip-down&quot;
              </code>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default FlipAnimation
