import { useSession } from 'next-auth/react'
import { useSelector } from 'react-redux'

import { RootState } from '@/slices/reducer'
import { api } from '@/trpc/react'

/**
 * Hook to check user permissions for managing agents and workflows
 *
 * Permission levels:
 * - SUPERADMIN: Can manage everything in all organizations
 * - OWNER: Can manage agents in their organization
 * - MEMBER: Read-only access
 */
export const usePermissions = () => {
  const { data: session } = useSession()
  const { currentProject } = useSelector((state: RootState) => state.Project)

  // Get user's role in the organization
  const { data: orgMembership, isLoading: isLoadingOrgRole } =
    api.organization.getMyRole.useQuery(
      { organizationId: currentProject?.organizationId || '' },
      { enabled: !!currentProject?.organizationId }
    )

  const isSuperAdmin = session?.user?.role === 'SUPERADMIN'
  const isOwner = orgMembership?.role === 'OWNER'
  const isOrgAdmin = orgMembership?.role === 'ADMIN'
  const isMember = orgMembership?.role === 'MEMBER'

  // Control flag: Set to false if only SUPERADMIN should manage agents
  const ALLOW_OWNER_TO_MANAGE = false

  // Permission calculations
  const canManageAgents = isSuperAdmin || (ALLOW_OWNER_TO_MANAGE && isOwner)
  const canViewAgents = true // Everyone can view

  return {
    // Main permissions
    canManageAgents, // Create/Edit/Delete agents and workflows
    canViewAgents, // View agents (read-only)

    // Role checks
    isSuperAdmin,
    isOwner,
    isOrgAdmin,
    isMember,

    // Organization role
    orgRole: orgMembership?.role,

    // Loading state
    isLoadingPermissions: isLoadingOrgRole,
  }
}
