'use client'

import React, { useState } from 'react'

import dynamic from 'next/dynamic'
import Image, { StaticImageData } from 'next/image'

import gallery1 from '@assets/images/gallery/img-01.jpg'
import gallery2 from '@assets/images/gallery/img-02.jpg'
import gallery3 from '@assets/images/gallery/img-03.jpg'
import gallery4 from '@assets/images/gallery/img-04.jpg'
import gallery5 from '@assets/images/gallery/img-05.jpg'
import gallery6 from '@assets/images/gallery/img-06.jpg'
import gallery11 from '@assets/images/gallery/long/img-01.jpg'
import { X } from 'lucide-react'

const ResponsiveMasonry = dynamic(
  () => import('react-responsive-masonry').then((mod) => mod.ResponsiveMasonry),
  {
    ssr: false,
  }
)
const Masonry = dynamic(() => import('react-responsive-masonry'), {
  ssr: false,
})

// Component
const MasonryWithLightboxGallery: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState('')

  // Handle image click to open lightbox
  const openLightbox = (src: StaticImageData) => {
    setImageSrc(src.src)
    setIsOpen(true)
  }

  // Handle close lightbox
  const closeLightbox = () => {
    setIsOpen(false)
  }

  return (
    <div className="card-body">
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-gray-900/60 z-[1050]"
          onClick={closeLightbox}>
          <div
            className="relative max-w-3xl mx-auto overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Prevent click events inside the lightbox from closing it
          >
            <button
              onClick={closeLightbox}
              className="absolute top-0 right-0 p-1.5 m-4 text-white rounded-full bg-gray-900 hover:text-red-500 transition ease-linear duration-200">
              <X />
            </button>
            <Image
              src={imageSrc}
              alt="galleryImg"
              className="object-contain rounded"
            />
          </div>
        </div>
      )}
      <ResponsiveMasonry columnsCountBreakPoints={{ 700: 1, 1100: 2, 1250: 3 }}>
        <Masonry
          columnsCount={3}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-64">
            <Image
              src={gallery1}
              alt="galleryImg"
              className="object-cover object-center w-full h-full rounded-sm cursor-pointer"
              onClick={() => openLightbox(gallery1)}
              width={452}
              height={256}
              style={{ padding: '10px' }}
            />
          </div>
          <div className="h-[25rem]">
            <Image
              src={gallery2}
              alt="galleryImg"
              className="object-cover object-center w-full h-full rounded-sm cursor-pointer"
              onClick={() => openLightbox(gallery2)}
              width={452}
              height={400}
              style={{ padding: '10px' }}
            />
          </div>
          <div className="h-72">
            <Image
              src={gallery4}
              alt="galleryImg"
              className="object-cover object-center w-full h-full rounded-sm cursor-pointer"
              onClick={() => openLightbox(gallery4)}
              width={452}
              height={288}
              style={{ padding: '10px' }}
            />
          </div>
          <div className="h-48">
            <Image
              src={gallery5}
              alt="galleryImg"
              className="object-cover object-center w-full h-full rounded-sm cursor-pointer"
              onClick={() => openLightbox(gallery5)}
              width={452}
              height={192}
              style={{ padding: '10px' }}
            />
          </div>
          <div className="h-80">
            <Image
              src={gallery6}
              alt="galleryImg"
              className="object-cover object-center w-full h-full rounded-sm cursor-pointer"
              onClick={() => openLightbox(gallery6)}
              width={452}
              height={320}
              style={{ padding: '10px' }}
            />
          </div>
          <div className="h-80">
            <Image
              src={gallery3}
              alt="galleryImg"
              className="object-cover object-center w-full h-full rounded-sm cursor-pointer"
              onClick={() => openLightbox(gallery3)}
              width={452}
              height={320}
              style={{ padding: '10px' }}
            />
          </div>
          <div className="h-96">
            <Image
              src={gallery11}
              alt="galleryImg"
              className="object-cover object-center w-full h-full rounded-sm cursor-pointer"
              onClick={() => openLightbox(gallery11)}
              width={452}
              height={384}
              style={{ padding: '10px' }}
            />
          </div>
        </Masonry>
      </ResponsiveMasonry>
    </div>
  )
}

export default MasonryWithLightboxGallery
