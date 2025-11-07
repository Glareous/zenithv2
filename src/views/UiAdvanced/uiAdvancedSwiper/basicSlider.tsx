'use client'

import React from 'react'

import Image from 'next/image'

import gallery1 from '@assets/images/gallery/img-01.jpg'
import gallery2 from '@assets/images/gallery/img-02.jpg'
import gallery3 from '@assets/images/gallery/img-03.jpg'
import gallery4 from '@assets/images/gallery/img-04.jpg'
import 'swiper/css'
import { Swiper, SwiperSlide } from 'swiper/react'

const BasicSlider = () => {
  return (
    <div className="col-span-12 md:col-span-6 card">
      <div className="card-header">
        <h6 className="card-title">Basic Slider</h6>
      </div>
      <div className="card-body">
        {/* Swiper */}
        <Swiper
          slidesPerView={1}
          pagination={{ clickable: true }}
          className="mySwiper">
          <SwiperSlide>
            <Image
              src={gallery1}
              alt="Slide 1"
              className="object-cover w-full h-full rounded-md"
            />
          </SwiperSlide>
          <SwiperSlide>
            <Image
              src={gallery2}
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
              src={gallery4}
              alt="Slide 4"
              className="object-cover w-full h-full rounded-md"
            />
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  )
}

export default BasicSlider
