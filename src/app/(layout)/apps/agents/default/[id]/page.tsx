'use client'

import { useEffect } from 'react'

import { useParams, useRouter } from 'next/navigation'

interface AgentPageProps {
  params: Promise<{ id: string }>
}

const AgentPage: React.FC<AgentPageProps> = ({ params }) => {
  const router = useRouter()
  const routeParams = useParams()

  useEffect(() => {
    const agentId = routeParams?.id as string
    if (agentId) {
      router.replace(`/apps/agents/default/${agentId}/configure`)
    }
  }, [router, routeParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
    </div>
  )
}

export default AgentPage
