'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'

import Aos from 'aos'
import 'aos/dist/aos.css'
import {
  CalendarPlus,
  Headset,
  Activity,
  ShieldCheck,
} from 'lucide-react'

// Importar configuración
import config from './landingConfig.json'

// Mapeo de strings a iconos
const iconMap: { [key: string]: React.ElementType } = {
  CalendarPlus,
  Headset,
  Activity,
  ShieldCheck,
}

const OurDoctorsTeam: React.FC = () => {
  const team = config.ourDoctorsTeam

  useEffect(() => {
    Aos.init({
      duration: 2000,
      once: true,
    })
  }, [])

  return (
    <React.Fragment>
      <section className="relative py-14 md:py-28" id="about-engine">
        <div className="container mx-auto px-4 xl:px-20">
          <div className="grid items-center grid-cols-1 gap-20 lg:grid-cols-2">
            {/* IMAGE SIDE */}
            <div>
              <div className="relative thumbnail before:absolute before:border ltr:before:-right-4 rtl:before:-left-4 before:size-full before:-bottom-4 before:border-violet-400 after:absolute after:size-full after:border ltr:after:-right-5 rtl:after:-left-5 after:-bottom-5 after:border-violet-300">
                <Image
                  src={team.images.aboutImage}
                  alt="NHITS Forecasting Engine"
                  className="relative z-10 rounded-xl"
                  width={648}
                  height={604}
                />
              </div>
            </div>

            {/* TEXT SIDE */}
            <div data-aos="fade-up">
              <h1 className="mb-2 text-4xl leading-normal capitalize xl:text-4xl md:text-5xl">
                {team.texts.title.part1}
                <span className={`underline decoration-dashed decoration-2 underline-offset-4 ${team.colors.titleDecoration} font-roboto-slab ${team.colors.titleHighlight} mx-2`}>
                  {team.texts.title.part2}
                </span>
                {team.texts.title.part3}
              </h1>

              <p className={`mb-5 ${team.colors.description} text-16`}>
                {team.texts.description}
              </p>

              <div className="grid grid-cols-1 gap-5 mb-6 sm:grid-cols-2 fs-16">
                {team.features.map((feature, index) => {
                  const Icon = iconMap[feature.icon]

                  return (
                    <div key={index} className="relative flex gap-3">
                      {Icon && <Icon className={`mt-1 ${team.colors.iconColor} size-5 shrink-0`} />}
                      <div>
                        <h6 className="mb-1">{feature.title}</h6>
                        <p className={team.colors.featureDesc}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center gap-3">
                {/* Botón comentado en el original */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  )
}

export default OurDoctorsTeam