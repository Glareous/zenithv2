'use client'

import React, { useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

type ProductData = {
  id: string
  name: string
  description: string | null
  price: number | null
  isActive: boolean
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
  categories: Array<{
    category: {
      id: string
      name: string
    }
  }>
  warehouses: Array<{
    warehouse: {
      id: string
      name: string
      warehouseId: string
      isDefault: boolean
      description: string | null
      createdAt: Date
      updatedAt: Date
      createdById: string
      projectId: string
      isActive: boolean
    }
    stock: number
  }>
  files: Array<{
    id: string
    s3Url: string
    name: string
  }>
}

const SwiperSection = () => {
  const searchParams = useSearchParams()
  const productId = searchParams.get('id')

  const currentProject = useSelector(
    (state: RootState) => state.Project.currentProject
  )
  const projectId = currentProject?.id || ''

  const { data: product, isLoading } = api.projectProduct.getById.useQuery(
    { id: productId! },
    { enabled: !!productId && !!projectId }
  )

  const [activeLink, setActiveLink] = useState('blue')
  const [activeSize, setActiveSize] = useState('s')

  const colorOptions = [
    { color: 'blue', bgColor: 'bg-blue-500' },
    { color: 'pink', bgColor: 'bg-pink-500' },
    { color: 'green', bgColor: 'bg-green-500' },
    { color: 'red', bgColor: 'bg-red-500' },
  ]
  const sizes = ['s', 'm', 'l', 'xl', '2xl']

  const productData = product as unknown as ProductData
  const productImages = productData?.files || []

  const imagesToShow =
    productImages.length > 0
      ? productImages
      : productData?.imageUrl
        ? [
            {
              id: 'default',
              s3Url: productData.imageUrl,
              name: 'Default Image',
            },
          ]
        : []

  if (isLoading) {
    return (
      <div className="sticky mb-5 top-24">
        <div className="card">
          <div className="card-body">
            <div className="bg-gray-100 dark:bg-dark-850 h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!productData || imagesToShow.length === 0) {
    return (
      <div className="sticky mb-5 top-24">
        <div className="card">
          <div className="card-body">
            <div className="bg-gray-100 dark:bg-dark-850 h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-medium text-gray-600">
                    {productData?.name?.charAt(0).toUpperCase() || 'P'}
                  </span>
                </div>
                <p className="text-gray-500">No images available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <React.Fragment>
      <div className="sticky mb-5 top-24">
        <div className="card">
          <div className="card-body">
            <div className="bg-gray-100 dark:bg-dark-850">
              <Swiper
                spaceBetween={10}
                slidesPerView={1}
                loop={true}
                autoplay={{ delay: 2500, disableOnInteraction: false }}
                navigation={{
                  nextEl: '.custom-swiper-next',
                  prevEl: '.custom-swiper-prev',
                }}
                modules={[Pagination, Autoplay, Navigation]}
                pagination={{
                  clickable: true,
                  type: 'fraction',
                  el: '.swiper-pagination',
                }}
                className="previewImages"
                dir="ltr">
                {imagesToShow.map((img) => (
                  <SwiperSlide key={img.id}>
                    <Image
                      src={img.s3Url}
                      alt={img.name}
                      width={350}
                      height={350}
                      className="mx-auto object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src =
                          '/assets/images/products/product-placeholder.png'
                      }}
                    />
                  </SwiperSlide>
                ))}

                <button
                  className="custom-swiper-prev absolute top-1/2 left-2 z-10 -translate-y-1/2 bg-white rounded-full p-2 shadow "
                  type="button">
                  <ChevronLeft className="w-6 h-6 text-primary-500" />
                </button>
                <button
                  className="custom-swiper-next absolute top-1/2 right-2 z-10 -translate-y-1/2 bg-white rounded-full p-2 shadow "
                  type="button">
                  <ChevronRight className="w-6 h-6 text-primary-500" />
                </button>
                <div className="swiper-pagination"></div>
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default SwiperSection
