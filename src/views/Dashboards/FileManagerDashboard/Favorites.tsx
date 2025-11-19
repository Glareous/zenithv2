'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import user10 from '@assets/images/avatar/user-10.png'
import user11 from '@assets/images/avatar/user-11.png'
import user14 from '@assets/images/avatar/user-14.png'
import user16 from '@assets/images/avatar/user-16.png'
import user17 from '@assets/images/avatar/user-17.png'
import pattern from '@assets/images/dashboards/ecommerce/pattern.png'
import fileManagerImg from '@assets/images/dashboards/file-manager.png'
import { NextPageWithLayout } from '@src/dtos'
import { Autoplay, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

const Favorites: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <div className="col-span-12 xl:col-span-4">
        <h6 className="mb-3">My Favorites</h6>
        <Swiper
          spaceBetween={30}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          modules={[Navigation, Autoplay]} // Add Autoplay module
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="mySwiper group/swiper"
          dir="ltr">
          <SwiperSlide>
            <div className="flex items-center gap-3 p-3 card bg-sky-100 dark:bg-sky-500/15 dark:border-sky-500/20 border-sky-200">
              <div className="grow">
                <h6 className="mb-1">
                  <Link href="#!">Images</Link>
                </h6>
                <p className="text-sm text-gray-500 dark:text-dark-500">
                  2471 Files
                </p>
              </div>
              <div>
                <div className="flex ml-3 -space-x-3 grow">
                  <Link
                    href="#!"
                    className="transition duration-300 ease-linear hover:z-10 hover:-translate-y-1">
                    <Image
                      className="border-2 border-white rounded-full dark:border-dark-900 size-8"
                      alt="userImg"
                      src={user14}
                    />
                  </Link>
                  <Link
                    href="#!"
                    className="transition duration-300 ease-linear hover:z-10 hover:-translate-y-1">
                    <Image
                      className="border-2 border-white rounded-full dark:border-dark-900 size-8"
                      alt="userImg"
                      src={user16}
                    />
                  </Link>
                  <Link
                    href="#!"
                    className="transition duration-300 ease-linear hover:z-10 hover:-translate-y-1">
                    <Image
                      className="border-2 border-white rounded-full dark:border-dark-900 size-8"
                      alt="userImg"
                      src={user17}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center gap-3 p-3 bg-pink-100 border-pink-200 dark:border-pink-500/20 card dark:bg-pink-500/15">
              <div className="grow">
                <h6 className="mb-1">
                  <Link href="#!">Download</Link>
                </h6>
                <p className="text-sm text-gray-500 dark:text-dark-500">
                  547 Files
                </p>
              </div>
              <div>
                <div className="flex ml-3 -space-x-3 grow">
                  <Link
                    href="#!"
                    className="transition duration-300 ease-linear hover:z-10 hover:-translate-y-1">
                    <Image
                      className="border-2 border-white rounded-full dark:border-dark-900 size-8"
                      alt="userImg"
                      src={user14}
                    />
                  </Link>
                  <Link
                    href="#!"
                    className="transition duration-300 ease-linear hover:z-10 hover:-translate-y-1">
                    <Image
                      className="border-2 border-white rounded-full dark:border-dark-900 size-8"
                      alt="userImg"
                      src={user17}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="flex items-center gap-3 p-3 bg-purple-100 border-purple-200 dark:border-purple-500/20 card dark:bg-purple-500/15">
              <div className="grow">
                <h6 className="mb-1">
                  <Link href="#!">Zenith Project</Link>
                </h6>
                <p className="text-sm text-gray-500 dark:text-dark-500">
                  1479 Files
                </p>
              </div>
              <div>
                <div className="flex ml-3 -space-x-3 grow">
                  <Link
                    href="#!"
                    className="transition duration-300 ease-linear hover:z-10 hover:-translate-y-1">
                    <Image
                      className="border-2 border-white rounded-full dark:border-dark-900 size-8"
                      alt="userImg"
                      src={user14}
                    />
                  </Link>
                  <Link
                    href="#!"
                    className="transition duration-300 ease-linear hover:z-10 hover:-translate-y-1">
                    <Image
                      className="border-2 border-white rounded-full dark:border-dark-900 size-8"
                      alt="userImg"
                      src={user16}
                    />
                  </Link>
                  <Link
                    href="#!"
                    className="transition duration-300 ease-linear hover:z-10 hover:-translate-y-1">
                    <Image
                      className="border-2 border-white rounded-full dark:border-dark-900 size-8"
                      alt="userImg"
                      src={user10}
                    />
                  </Link>
                  <Link
                    href="#!"
                    className="transition duration-300 ease-linear hover:z-10 hover:-translate-y-1">
                    <Image
                      className="border-2 border-white rounded-full dark:border-dark-900 size-8"
                      alt="userImg"
                      src={user11}
                    />
                  </Link>
                  <Link
                    href="#!"
                    className="transition duration-300 ease-linear hover:z-10 hover:-translate-y-1">
                    <Image
                      className="border-2 border-white rounded-full dark:border-dark-900 size-8"
                      alt="userImg"
                      src={user17}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
          <div className="swiper-button-next after:font-remix after:text-2xl after:text-primary-500 size-6 bg-white rounded-full opacity-0 group-hover/swiper:opacity-100 transition ease-linear duration-300 after:content-['\ea6e']"></div>
          <div className="swiper-button-prev after:font-remix after:text-2xl after:text-primary-500 size-6 bg-white rounded-full opacity-0 group-hover/swiper:opacity-100 transition ease-linear duration-300 after:content-['\ea64']"></div>
        </Swiper>
        <div className="relative card">
          <div className="absolute bottom-0 right-0 opacity-45">
            <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-dark-900"></div>
            <Image src={pattern} alt="pattern" className="h-40" />
          </div>
          <div className="relative card-body">
            <Image
              src={fileManagerImg}
              alt="fileManagerImg"
              className="h-32 mx-auto"
              width={128}
              height={128}
            />
            <h6 className="mt-5 mb-1">Upgrade to Pro</h6>
            <p className="mb-5 text-gray-500 dark:text-dark-500">
              Unlock your plan to Pro to get access all features!
            </p>
            <Link
              href="/page/pricing"
              type="button"
              className="w-full btn btn-primary">
              Upgrade Now
            </Link>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
export default Favorites
