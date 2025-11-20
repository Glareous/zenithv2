'use client'

import { ReactNode, useEffect } from 'react'

import { usePathname } from 'next/navigation'

import { routes } from '@src/components/common/DynamicTitle'
import Layout2 from '@src/layout/Layout2'

interface LayoutWrapperProps {
  children: ReactNode
}

export default function NonLayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const route = routes.find((r) => r.path === pathname)

  useEffect(() => {
    document.title = route
      ? `${route.title} | Zenith - Ai apps`
      : 'Zenith - Ai apps'
  }, [route])

  return <Layout2>{children}</Layout2>
}
