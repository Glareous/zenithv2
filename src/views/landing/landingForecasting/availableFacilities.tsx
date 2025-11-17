'use client'

import React from 'react'
import Link from 'next/link'

import {
  Database,
  CalendarClock,
  Cpu,
  Activity,
  FileText,
  Network,
} from 'lucide-react'

// Importar configuración
import config from './landingConfig.json'

// Mapeo de strings a iconos
const iconMap: { [key: string]: React.ElementType } = {
  Database,
  CalendarClock,
  Cpu,
  Activity,
  FileText,
  Network,
}

const AvailableFacilities: React.FC = () => {
  const facilities = config.availableFacilities

  return (
    <React.Fragment>
      <section className="pt-14">
        <div className="container mx-auto px-4 xl:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-x-space">

            {facilities.facilities.map((facility, index) => {
              const Icon = iconMap[facility.icon]

              return (
                <Link
                  key={index}
                  href={facility.href}
                  className={`block text-center card ${facilities.colors.cardBg} ${facilities.colors.cardBorder} ${facilities.colors.cardHover} transition-all`}>
                  <div className="card-body">
                    <div className={`flex items-center justify-center mx-auto mb-5 ${facilities.colors.iconBg} rounded-full size-16 ${facilities.colors.iconColor}`}>
                      {Icon && <Icon className="size-6" />}
                    </div>
                    <h6 className={facilities.colors.titleColor}>
                      {facility.title}
                    </h6>
                    <p className={`text-xs mt-1 ${facilities.colors.descColor}`}>
                      {facility.description}
                    </p>
                  </div>
                </Link>
              )
            })}

          </div>
        </div>
      </section>
    </React.Fragment>
  )
}

export default AvailableFacilities