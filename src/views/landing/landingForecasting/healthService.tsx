'use client'

import React from 'react'
import Link from 'next/link'

import {
  LineChart,
  PackageSearch,
  ShoppingCart,
  Factory,
  Users,
  Activity,
  MoveLeft,
  MoveRight,
} from 'lucide-react'

const services = [
  {
    title: 'Sales demand forecasting',
    desc: 'Predict future sales by product, store or channel using NHITS, capturing promotions, seasonality and long-term trends in one deep-learning model.',
    icon: ShoppingCart,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
  },
  {
    title: 'Inventory & stock optimization',
    desc: 'Anticipate stock levels, avoid stock-outs and overstock, and align purchase orders with realistic demand scenarios and confidence intervals.',
    icon: PackageSearch,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
  {
    title: 'Revenue & KPI projections',
    desc: 'Generate forward-looking revenue and KPI curves, helping finance and management teams plan budgets, targets and what-if scenarios.',
    icon: LineChart,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    title: 'Supply chain & production planning',
    desc: 'Use multi-step forecasts to align production, logistics and capacity with expected demand, reducing bottlenecks and last-minute firefighting.',
    icon: Factory,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-500',
  },
  {
    title: 'Workforce & staffing needs',
    desc: 'Forecast workload over time and translate it into staffing plans, shifts and scheduling decisions, smoothing peaks and underutilization.',
    icon: Users,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-500',
  },
  {
    title: 'Risk, peaks & anomalies',
    desc: 'Identify potential spikes, drops and anomalous behavior in advance, combining NHITS forecasts with confidence bands and residual analysis.',
    icon: Activity,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
]

const HealthService: React.FC = () => {
  return (
    <React.Fragment>
      <section
        className="relative py-14 md:py-28 bg-gray-50 dark:bg-dark-900/30"
        id="services"
      >
        <div className="container mx-auto px-4 xl:px-20">
          <div className="max-w-2xl mx-auto mb-12 text-center">
            <h2 className="mb-2 text-4xl leading-normal capitalize md:text-5xl">
              Forecasting{" "}
              <span className="underline decoration-dashed decoration-2 underline-offset-4 decoration-fuchsia-400 font-roboto-slab text-violet-600">
                use cases
              </span>
            </h2>
            <p className="text-gray-600 dark:text-dark-500 text-16">
              These are some of the key scenarios where NHITS, running on GPU,
              delivers high-quality forecasts that directly impact your business
              decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space">
            {services.map((item, index) => (
              <div
                key={index}
                className="p-5 rounded-lg bg-white/70 dark:bg-dark-900/60 hover:bg-white dark:hover:bg-dark-950 transition duration-300 ease-linear hover:-translate-y-2 hover:shadow-lg hover:shadow-violet-200/80 dark:hover:shadow-dark-850"
              >
                <div
                  className={`flex items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor} size-14 mb-4`}
                >
                  <item.icon className="size-7" />
                </div>
                <h5 className="mb-2 text-lg font-semibold">{item.title}</h5>
                <p className="mb-3 text-gray-600 dark:text-dark-500 text-16">
                  {item.desc}
                </p>
                {/* <Link
                  href="#!"
                  className="font-medium inline-flex items-center text-violet-600 hover:text-violet-700"
                >
                  Learn more
                  <MoveRight className="inline-block ml-1 rtl:hidden size-4" />
                  <MoveLeft className="hidden mr-1 rtl:inline-block size-4" />
                </Link> */}
              </div>
            ))}
          </div>
        </div>
      </section>
    </React.Fragment>
  )
}

export default HealthService
