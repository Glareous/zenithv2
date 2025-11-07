import { ReactNode } from 'react'

interface AgentLayoutProps {
  children: ReactNode
}

export default function Layout({ children }: AgentLayoutProps) {
  return children
}
