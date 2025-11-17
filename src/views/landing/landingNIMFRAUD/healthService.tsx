'suse client'

import React from 'react'
import {
  BrainCircuit,
  Siren,
  Crown,
  Timer,
  FileSearch,
  ShieldCheck,
  Zap,
  Target,
  UsersRound,
  FileCheck,
  Scale,
  Handshake,
  MessageSquareWarning,
  TrendingUp,
  Trophy,
  Activity,
} from 'lucide-react'

import config from './landingConfig.json'

const iconMap = {
  BrainCircuit,
  Siren,
  Crown,
  Timer,
  FileSearch,
  ShieldCheck,
  Zap,
  Target,
  UsersRound,
  FileCheck,
  Scale,
  Handshake,
  MessageSquareWarning,
  TrendingUp,
  Trophy,
  Activity,
} as const  // ← importante: "as const"

const HealthService: React.FC = () => {
  const service = config.healthService

  return (
    <section className={`relative py-14 md:py-28 ${service.colors.sectionBg}`} id="services">
      <div className="container mx-auto px-4 xl:px-20">
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h2 className="mb-2 text-4xl leading-normal capitalize md:text-5xl">
            {service.texts.title.part1}{" "}
            <span className={`underline decoration-dashed decoration-2 underline-offset-4 ${service.colors.titleDecoration} font-roboto-slab ${service.colors.titleHighlight}`}>
              {service.texts.title.part2}
            </span>
            {service.texts.title.part3}
          </h2>
          <p className={`${service.colors.description} text-16`}>
            {service.texts.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space">
          {service.services.map((item, index) => {
            // LÍNEA MÁGICA QUE LO ARREGLA TODO
            const Icon = iconMap[item.icon as keyof typeof iconMap]

            return (
              <div
                key={index}
                className={`p-5 rounded-lg ${service.colors.cardBg} transition duration-300 ease-linear ${service.colors.cardHover}`}
              >
                <div className={`flex items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor} size-14 mb-4`}>
                  {Icon && <Icon className="size-7" />}
                </div>
                <h5 className="mb-2 text-lg font-semibold">{item.title}</h5>
                <p className={`mb-3 ${service.colors.serviceDesc} text-16`}>
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HealthService