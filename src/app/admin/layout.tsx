import { ReactNode } from 'react'

import LayoutWrapper from '@src/components/layout/LayoutWrapper'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <LayoutWrapper>{children}</LayoutWrapper>
}
