'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import UseNumberCounter from '@src/components/common/NumberCounter'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { Menu, X, Sun, Moon, Phone } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { changeLayoutMode } from '@src/slices/thunk'
import { LAYOUT_MODE_TYPES } from '@src/components/constants/layout'

// Importar configuración
import config from './landingConfig.json'

const HeroBanner: React.FC = () => {
  const [isSticky, setIsSticky] = useState(false)


  const { layoutMode } = useSelector((state: RootState) => state.Layout)


  // Extraer configuración del hero
  const hero = config.heroBanner

  // Sticky + AOS
  useEffect(() => {
    AOS.init({ duration: 1000, once: true })

    const handleScroll = () => {
      setIsSticky(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* ===================== HERO CONTENT ===================== */}
      <section
        className={`relative pb-0 overflow-hidden pt-44 ${hero.colors.background}`}
        id="home"
      >
        {/* Floating shapes */}
        <div className="absolute hidden size-28 bg-violet-500/15 clip-path-plus ltr:right-64 rtl:left-64 top-64 animate-pulse lg:inline-block" />
        <div className="absolute hidden rotate-45 size-28 bg-white/60 dark:bg-white/10 clip-path-plus ltr:left-1/2 rtl:right-1/2 lg:inline-block bottom-1/3" />

        <div className="container mx-auto px-4 relative xl:px-20 pt-10">
          <div className="grid items-center grid-cols-12 gap-4 lg:gap-x-16">
            {/* LEFT: TEXT */}
            <div className="col-span-12 xl:col-span-6" data-aos="fade-up" data-aos-duration="2000">
              <div className="mb-8">
                <p className={`relative ltr:pl-10 rtl:pr-10 mb-2 text-lg font-medium ${hero.colors.badge.text} before:w-8 before:${hero.colors.badge.border} before:absolute before:h-[2px] before:top-1/2 before:-translate-y-1/2 ltr:before:left-0 rtl:before:right-0`}>
                  {hero.texts.badge}
                </p>

                <h1 className="mb-4 text-4xl capitalize md:leading-normal xl:leading-normal md:text-5xl xl:text-6xl">
                  <span className="inline-block">{hero.texts.title.part1}</span>
                  <span className={`inline-block mx-4 underline decoration-dashed decoration-2 underline-offset-4 ${hero.colors.title.decoration} font-roboto-slab ${hero.colors.title.highlight}`}>
                    {hero.texts.title.part2}
                  </span>
                  <span className="inline-block">{hero.texts.title.part3}</span>
                </h1>

                <p className={`mb-8 text-lg ${hero.colors.description}`}>
                  {hero.texts.description}
                </p>
              </div>
            </div>

            {/* RIGHT: IMAGE */}
            <div className="col-span-12 xl:col-span-5 xl:col-start-8">
              <div className="relative">
                <Image
                  src={hero.images.mainHome}
                  alt="NHITS GPU forecasting dashboard"
                  className="relative xl:scale-[1.3] -bottom-12 drop-shadow-2xl"
                  width={536}
                  height={637}
                />
              </div>
            </div>
          </div>

          {/* METRIC CARD */}
          <div className={`relative mt-12 border-none card ${hero.colors.card.background} ${hero.colors.card.text} bottom-2 2xl:bottom-10 shadow-xl ${hero.colors.card.shadow}`}>
            <div className="p-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
                {hero.metrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <h4 className="mb-2">
                      <span>
                        <UseNumberCounter start={0} end={metric.value} duration={3000} />
                      </span>
                      {metric.suffix}
                    </h4>
                    <p className={`${hero.colors.metricText} text-16`}>
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default HeroBanner