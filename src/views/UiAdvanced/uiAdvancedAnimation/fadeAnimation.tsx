'use client'

import React, { useEffect } from 'react'

import AOS from 'aos'
import 'aos/dist/aos.css'

const FadeAnimation = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000, // Duration of animation
      once: true, // Whether animation should happen only once - while scrolling down
    })
  }, [])

  return (
    <React.Fragment>
      <h5 className="mb-5 underline">Fade Animation:</h5>
      <div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-x-space">
        <div className="card">
          <div className="card-body">
            <div
              className="mx-auto size-56 sm:size-64 md:size-80 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-sky-500/20"
              data-aos="fade-up"></div>
            <div className="mt-3 text-center">
              <code className="text-pink-500">
                data-aos=&quot;fade-up&quot;
              </code>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div
              className="mx-auto size-56 sm:size-64 md:size-80 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-sky-500/20"
              data-aos="fade-down"></div>
            <div className="mt-3 text-center">
              <code className="text-pink-500">
                data-aos=&quot;fade-down&quot;
              </code>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div
              className="mx-auto size-56 sm:size-64 md:size-80 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-sky-500/20"
              data-aos="fade-right"></div>
            <div className="mt-3 text-center">
              <code className="text-pink-500">
                data-aos=&quot;fade-right&quot;
              </code>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div
              className="mx-auto size-56 sm:size-64 md:size-80 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-sky-500/20"
              data-aos="fade-left"></div>
            <div className="mt-3 text-center">
              <code className="text-pink-500">
                data-aos=&quot;fade-left&quot;
              </code>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div
              className="mx-auto size-56 sm:size-64 md:size-80 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-sky-500/20"
              data-aos="fade-up-right"></div>
            <div className="mt-3 text-center">
              <code className="text-pink-500">
                data-aos=&quot;fade-up-right&quot;
              </code>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div
              className="mx-auto size-56 sm:size-64 md:size-80 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-sky-500/20"
              data-aos="fade-up-left"></div>
            <div className="mt-3 text-center">
              <code className="text-pink-500">
                data-aos=&quot;fade-up-left&quot;
              </code>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div
              className="mx-auto size-56 sm:size-64 md:size-80 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-sky-500/20"
              data-aos="fade-down-right"></div>
            <div className="mt-3 text-center">
              <code className="text-pink-500">
                data-aos=&quot;fade-down-right&quot;
              </code>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div
              className="mx-auto size-56 sm:size-64 md:size-80 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-sky-500/20"
              data-aos="fade-down-left"></div>
            <div className="mt-3 text-center">
              <code className="text-pink-500">
                data-aos=&quot;fade-down-left&quot;
              </code>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default FadeAnimation
