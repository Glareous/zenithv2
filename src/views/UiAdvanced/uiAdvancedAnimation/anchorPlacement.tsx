'use client'

import React, { useEffect } from 'react'

import AOS from 'aos'
import 'aos/dist/aos.css'

const AnchorPlacement = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000, // Default duration for animations
      once: true, // Whether animations should happen only once
    })
  }, [])
  return (
    <React.Fragment>
      <h5 className="mb-5 underline">Anchor placement:</h5>
      <div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-x-space">
        <div className="card">
          <div className="card-body">
            <div
              className="mx-auto size-56 sm:size-64 md:size-80 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-sky-500/20"
              data-aos="fade-up"
              data-aos-anchor-placement="top-bottom"></div>
            <div className="mt-3 text-center">
              <code className="text-pink-500">
                data-aos=&quot;fade-up&quot;
                data-aos-anchor-placement=&quot;top-bottom&quot;
              </code>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div
              className="mx-auto size-56 sm:size-64 md:size-80 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-sky-500/20"
              data-aos="fade-up"
              data-aos-anchor-placement="center-bottom"></div>
            <div className="mt-3 text-center">
              <code className="text-pink-500">
                data-aos=&quot;fade-up&quot;
                data-aos-anchor-placement=&quot;center-bottom&quot;
              </code>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div
              className="mx-auto size-56 sm:size-64 md:size-80 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-sky-500/20"
              data-aos="fade-up"
              data-aos-anchor-placement="center-center"></div>
            <div className="mt-3 text-center">
              <code className="text-pink-500">
                data-aos=&quot;fade-up&quot;
                data-aos-anchor-placement=&quot;center-center&quot;
              </code>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div
              className="mx-auto size-56 sm:size-64 md:size-80 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-sky-500/20"
              data-aos="fade-up"
              data-aos-anchor-placement="bottom-bottom"></div>
            <div className="mt-3 text-center">
              <code className="text-pink-500">
                data-aos=&quot;fade-up&quot;
                data-aos-anchor-placement=&quot;bottom-bottom&quot;
              </code>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default AnchorPlacement
