'use client'

import React, { useMemo } from 'react'

import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { useSelector } from 'react-redux'

type OrderStatsCardsProps = {
  projectId: string
}

const OrderStatsCards: React.FC<OrderStatsCardsProps> = ({ projectId }) => {
  console.log('OrderStatsCards - projectId:', projectId)

  const {
    data: allOrdersData,
    isLoading,
    error,
  } = api.projectOrders.getAll.useQuery(
    {
      projectId,
      page: 1,
      limit: 100,
      search: undefined,
    },
    {
      enabled: !!projectId && projectId !== '',
      staleTime: 5 * 60 * 1000,
    }
  )

  console.log('OrderStatsCards - allOrdersData:', allOrdersData)
  console.log('OrderStatsCards - isLoading:', isLoading)
  console.log('OrderStatsCards - error:', error)

  const stats = useMemo(() => {
    if (!allOrdersData?.orders) {
      console.log('OrderStatsCards - No orders data available')
      return {
        newOrders: { count: 0, percentage: '0%' },
        pendingOrders: { count: 0, percentage: '0%' },
        deliveredOrders: { count: 0, percentage: '0%' },
        totalOrders: { count: 0, percentage: '0%' },
      }
    }

    const orders = allOrdersData.orders
    const totalOrders = orders.length

    console.log('OrderStatsCards - Processing orders:', orders.length)

    const newOrders = orders.filter((order) => order.status === 'NEW').length
    const pendingOrders = orders.filter(
      (order) => order.status === 'PENDING'
    ).length
    const deliveredOrders = orders.filter(
      (order) => order.status === 'DELIVERED'
    ).length

    const newPercentage =
      totalOrders > 0 ? ((newOrders / totalOrders) * 100).toFixed(1) : '0'
    const pendingPercentage =
      totalOrders > 0 ? ((pendingOrders / totalOrders) * 100).toFixed(1) : '0'
    const deliveredPercentage =
      totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : '0'
    const totalPercentage = '100'

    console.log('OrderStatsCards - Stats calculated:', {
      newOrders,
      pendingOrders,
      deliveredOrders,
      totalOrders,
      newPercentage,
      pendingPercentage,
      deliveredPercentage,
    })

    return {
      newOrders: { count: newOrders, percentage: `${newPercentage}%` },
      pendingOrders: {
        count: pendingOrders,
        percentage: `${pendingPercentage}%`,
      },
      deliveredOrders: {
        count: deliveredOrders,
        percentage: `${deliveredPercentage}%`,
      },
      totalOrders: { count: totalOrders, percentage: `${totalPercentage}%` },
    }
  }, [allOrdersData?.orders])

  const cards = [
    {
      title: 'New Orders',
      count: stats.newOrders.count,
      percentage: stats.newOrders.percentage,
      class:
        'bg-primary-100 dark:bg-primary-500/10 !border-primary-200 dark:!border-primary-500/20',
      icon: 'ri-arrow-right-up-line',
    },
    {
      title: 'Pending Orders',
      count: stats.pendingOrders.count,
      percentage: stats.pendingOrders.percentage,
      class:
        'bg-yellow-100 dark:bg-yellow-500/10 !border-yellow-200 dark:!border-yellow-500/20',
      icon: 'ri-arrow-right-down-line',
    },
    {
      title: 'Delivered Orders',
      count: stats.deliveredOrders.count,
      percentage: stats.deliveredOrders.percentage,
      class:
        'bg-green-100 dark:bg-green-500/10 !border-green-200 dark:!border-green-500/20',
      icon: 'ri-arrow-right-up-line',
    },
    {
      title: 'Total Orders',
      count: stats.totalOrders.count,
      percentage: stats.totalOrders.percentage,
      class:
        'bg-purple-100 dark:bg-purple-500/10 !border-purple-200 dark:!border-purple-500/20',
      icon: 'ri-arrow-right-up-line',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 mb-6">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="card animate-pulse">
            <div className="card-body">
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="flex items-center divide-x *:px-3 divide-gray-300">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 mb-6">
        <div className="col-span-full">
          <div className="card bg-red-50 border-red-200">
            <div className="card-body text-center">
              <p className="text-red-600">Error loading order statistics</p>
              <p className="text-sm text-red-500">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 mb-6">
      {cards.map((card, index) => (
        <div key={index} className={`card ${card.class}`}>
          <div className="card-body">
            <h6 className="mb-3">{card.title}</h6>
            <div className="flex items-center divide-x *:px-3 divide-gray-300 dark:divide-dark-800">
              <h4 className="ltr:pl-0 rtl:pr-0">{card.count}</h4>
              <p className="text-gray-500">
                <span className="font-semibold">
                  <i className={card.icon}></i> {card.percentage}
                </span>
                of total
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default OrderStatsCards
