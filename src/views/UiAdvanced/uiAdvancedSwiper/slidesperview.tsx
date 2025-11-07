'use client'

import React from 'react'

import Image from 'next/image'

import gallery2 from '@assets/images/gallery/img-02.jpg'
import gallery3 from '@assets/images/gallery/img-03.jpg'
import gallery4 from '@assets/images/gallery/img-04.jpg'
import gallery5 from '@assets/images/gallery/img-05.jpg'
import gallery6 from '@assets/images/gallery/img-06.jpg'
import 'swiper/css'
// Import Swiper core styles
import 'swiper/css/pagination'
// Import Pagination module styles
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

const SlidesPreview = () => {
  return (
    <div className="col-span-12 card">
      <div className="card-header">
        <h6 className="card-title">Slides per view</h6>
      </div>
      <div className="card-body">
        {/* Swiper */}
        <Swiper
          className="slidersPerView"
          pagination={{ clickable: true }}
          spaceBetween={30}
          slidesPerView={1}
          modules={[Pagination]} // Include Pagination module
          breakpoints={{
            375: {
              slidesPerView: 1.5,
              spaceBetween: 20,
            },
            557: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
          }}>
          <SwiperSlide>
            <Image
              src={gallery5}
              alt="Slide 1"
              className="object-cover w-full h-full rounded-md"
            />
          </SwiperSlide>
          <SwiperSlide>
            <Image
              src={gallery6}
              alt="Slide 2"
              className="object-cover w-full h-full rounded-md"
            />
          </SwiperSlide>
          <SwiperSlide>
            <Image
              src={gallery3}
              alt="Slide 3"
              className="object-cover w-full h-full rounded-md"
            />
          </SwiperSlide>
          <SwiperSlide>
            <Image
              src={gallery2}
              alt="Slide 4"
              className="object-cover w-full h-full rounded-md"
            />
          </SwiperSlide>
          <SwiperSlide>
            <Image
              src={gallery4}
              alt="Slide 5"
              className="object-cover w-full h-full rounded-md"
            />
          </SwiperSlide>
        </Swiper>
      </div>
      {/* Add Tailwind CSS styles for pagination bullets */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background-color: #38bdf8; /* Tailwind color for green (e.g., bg-teal-400) */
        }
        .swiper-pagination-bullet-active {
          background-color: #10b981; /* Tailwind color for active green (e.g., bg-green-500) */
        }
      `}</style>
    </div>
  )
}

export default SlidesPreview
