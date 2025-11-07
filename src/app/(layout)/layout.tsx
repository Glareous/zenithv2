import { ReactNode } from 'react'

import LayoutWrapper from '@src/components/layout/LayoutWrapper'

interface DefaultLayoutProps {
  children: ReactNode
}
export default function Layout({ children }: DefaultLayoutProps) {
  return <LayoutWrapper>{children}</LayoutWrapper>
}
