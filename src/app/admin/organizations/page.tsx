'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import { Modal } from '@src/components/custom/modal/modal'
import TableContainer from '@src/components/custom/table/table'
import ModalSelectAgent from '@src/components/organisms/ModalSelectAgent'
import { NextPageWithLayout } from '@src/dtos'
import { api } from '@src/trpc/react'
import {
  Building2,
  CirclePlus,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

const organizationSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must be lowercase alphanumeric with hyphens only'
    ),
  administrators: z
    .array(
      z.object({
        id: z.string().optional(), // For existing admins
        userId: z.string().optional(), // For existing admins
        membershipId: z.string().optional(), // OrganizationMember ID
        role: z.string().optional(), // OWNER or ADMIN
        isExisting: z.boolean().optional(), // Flag to identify existing admins
        toDelete: z.boolean().optional(), // Flag to mark for deletion
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        username: z.string().min(1, 'Username is required'),
        email: z.string().email('Invalid email address'),
        password: z.string().optional(), // Optional for existing admins
      })
    )
    .min(1, 'At least one administrator is required'),
  allowedPages: z.array(z.string()).optional(),
  agentPqrId: z.string().optional(),
  agentRrhhId: z.string().optional(),
  agentForecastingId: z.string().optional(),
  agentRrhhChatId: z.string().optional(),
  agentAdvisorChatId: z.string().optional(),
  agentAdvisorId: z.string().optional(),
  agentLeadsId: z.string().optional(),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

const OrganizationManagementPage: NextPageWithLayout = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [slugValue, setSlugValue] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [showAgentModal, setShowAgentModal] = useState(false)
  const [selectedAgentType, setSelectedAgentType] = useState<
    'pqr' | 'rrhh' | 'forecasting' | 'advisor' | 'leads' | 'rrhhChat' | 'advisorChat' | null
  >(null)

  // Check if user is SUPERADMIN
  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/signin-basic')
      return
    }

    if (session?.user?.role !== 'SUPERADMIN') {
      toast.error('Access denied. Only super admins can access this page.')
      router.push('/dashboards/ecommerce')
    }
  }, [session, status, router])

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      description: '',
      logoUrl: '',
      slug: '',
      administrators: [
        {
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          password: '',
        },
      ],
      allowedPages: [],
      agentPqrId: undefined,
      agentRrhhId: undefined,
      agentForecastingId: undefined,
      agentRrhhChatId: undefined,
      agentAdvisorChatId: undefined,
      agentAdvisorId: undefined,
      agentLeadsId: undefined,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'administrators',
  })

  // Query to get all agents (both global and specific) for assignment
  const { data: allAgents = [] } = api.projectAgent.getAll.useQuery(
    {}, // Get all agents without filtering
    {
      enabled:
        status === 'authenticated' && session?.user?.role === 'SUPERADMIN',
    }
  )

  // Query to get all organizations (superadmin only)
  const {
    data: organizations = [],
    isLoading,
    refetch,
  } = api.organization.getAll.useQuery(undefined, {
    enabled: session?.user?.role === 'SUPERADMIN',
  })

  // Mutations
  const createMutation = api.organization.create.useMutation({
    onSuccess: () => {
      toast.success('Organization created successfully')
      refetch()
      closeModal()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create organization')
    },
  })

  const updateMutation = api.organization.update.useMutation({
    onSuccess: () => {
      toast.success('Organization updated successfully')
      refetch()
      closeModal()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update organization')
    },
  })

  const deleteMutation = api.organization.delete.useMutation({
    onSuccess: () => {
      toast.success('Organization deleted successfully')
      refetch()
      setShowDeleteModal(false)
      setSelectedOrganization(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete organization')
    },
  })

  const getLogoUploadUrlMutation =
    api.organization.getLogoUploadUrl.useMutation()
  const createOrganizationFileMutation =
    api.organizationFile.create.useMutation()

  // Handle logo file selection
  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG or JPG)')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }

    setLogoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Upload logo to S3 and create OrganizationFile record
  const uploadLogoToS3 = async (
    organizationId: string
  ): Promise<string | null> => {
    if (!logoFile) return null

    try {
      setIsUploadingLogo(true)

      // Get presigned URL from backend
      const { uploadUrl, s3Url, s3Key, fileName } =
        await getLogoUploadUrlMutation.mutateAsync({
          fileName: logoFile.name,
          fileType: logoFile.type,
          fileSize: logoFile.size,
          organizationId,
        })

      // Upload file to S3 using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: logoFile,
        headers: {
          'Content-Type': logoFile.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload logo to S3')
      }

      // Determine file type enum
      const getFileTypeEnum = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return 'IMAGE'
        if (mimeType.startsWith('video/')) return 'VIDEO'
        if (mimeType.startsWith('audio/')) return 'AUDIO'
        if (
          mimeType === 'application/pdf' ||
          mimeType.startsWith('application/')
        )
          return 'DOCUMENT'
        return 'OTHER'
      }

      // Create OrganizationFile record in database
      await createOrganizationFileMutation.mutateAsync({
        organizationId,
        name: logoFile.name,
        fileName: fileName,
        fileType: getFileTypeEnum(logoFile.type),
        mimeType: logoFile.type,
        fileSize: logoFile.size,
        s3Key: s3Key,
        description: 'Organization logo',
        isPublic: true,
      })

      return s3Url
    } catch (error) {
      console.error('Logo upload error:', error)
      toast.error('Failed to upload logo')
      return null
    } finally {
      setIsUploadingLogo(false)
    }
  }

  // Modal handlers
  const openCreateModal = () => {
    setIsEditMode(false)
    setLogoPreview(null)
    setSlugValue('')
    setLogoFile(null)
    reset({
      name: '',
      description: '',
      logoUrl: '',
      slug: '',
      administrators: [
        {
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          password: '',
        },
      ],
      allowedPages: [],
      agentPqrId: undefined,
      agentRrhhId: undefined,
      agentForecastingId: undefined,
      agentRrhhChatId: undefined,
      agentAdvisorChatId: undefined,
      agentAdvisorId: undefined,
      agentLeadsId: undefined,
    })
    setShowModal(true)
  }

  const openEditModal = (organization: any) => {
    setIsEditMode(true)
    setSelectedOrganization(organization)
    setSlugValue(organization.slug)
    setLogoPreview(organization.logoUrl || null)

    // Load existing administrators from members
    const existingAdmins =
      organization.members?.map((member: any) => ({
        id: member.user.id,
        userId: member.user.id,
        membershipId: member.id,
        role: member.role,
        isExisting: true,
        toDelete: false,
        firstName: member.user.firstName,
        lastName: member.user.lastName,
        username: member.user.username,
        email: member.user.email,
        password: '', // Empty for existing users
      })) || []

    reset({
      name: organization.name,
      description: organization.description || '',
      logoUrl: organization.logoUrl || '',
      slug: organization.slug,
      allowedPages: organization.allowedPages || [],
      agentPqrId: organization.agentPqrId || undefined,
      agentRrhhId: organization.agentRrhhId || undefined,
      agentForecastingId: organization.agentForecastingId || undefined,
      agentRrhhChatId: organization.agentRrhhChatId || undefined,
      agentAdvisorChatId: organization.agentAdvisorChatId || undefined,
      agentAdvisorId: organization.agentAdvisorId || undefined,
      agentLeadsId: organization.agentLeadsId || undefined,
      administrators: existingAdmins,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setIsEditMode(false)
    setSelectedOrganization(null)
    reset()
  }

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      if (isEditMode && selectedOrganization) {
        // For edit mode, upload logo first if file selected
        let logoUrl = data.logoUrl
        if (logoFile) {
          const uploadedLogoUrl = await uploadLogoToS3(selectedOrganization.id)
          if (uploadedLogoUrl) {
            logoUrl = uploadedLogoUrl
          }
        }

        // Separate new and existing administrators
        const administratorsToAdd = data.administrators
          .filter((admin) => !admin.isExisting)
          .map((admin) => ({
            firstName: admin.firstName,
            lastName: admin.lastName,
            username: admin.username,
            email: admin.email,
            password: admin.password!,
          }))

        // Track which existing administrators were removed
        const initialAdminIds =
          selectedOrganization.members?.map((m: any) => m.id) || []
        const currentAdminIds = data.administrators
          .filter((admin) => admin.isExisting)
          .map((admin) => admin.membershipId!)
        const administratorsToRemove = initialAdminIds.filter(
          (id: string) => !currentAdminIds.includes(id)
        )

        await updateMutation.mutateAsync({
          id: selectedOrganization.id,
          name: data.name,
          logoUrl,
          slug: data.slug,
          allowedPages: data.allowedPages,
          agentPqrId: data.agentPqrId || null,
          agentRrhhId: data.agentRrhhId || null,
          agentForecastingId: data.agentForecastingId || null,
          agentRrhhChatId: data.agentRrhhChatId || null,
          agentAdvisorChatId: data.agentAdvisorChatId || null,
          agentAdvisorId: data.agentAdvisorId || null,
          agentLeadsId: data.agentLeadsId || null,
          administratorsToAdd:
            administratorsToAdd.length > 0 ? administratorsToAdd : undefined,
          administratorsToRemove:
            administratorsToRemove.length > 0
              ? administratorsToRemove
              : undefined,
        })
      } else {
        // For create mode, create organization first, then upload logo
        const newOrganization = await createMutation.mutateAsync({
          name: data.name,
          slug: data.slug,
          allowedPages: data.allowedPages || [],
          agentPqrId: data.agentPqrId,
          agentRrhhId: data.agentRrhhId,
          agentForecastingId: data.agentForecastingId,
          agentRrhhChatId: data.agentRrhhChatId,
          agentAdvisorChatId: data.agentAdvisorChatId,
          agentAdvisorId: data.agentAdvisorId,
          agentLeadsId: data.agentLeadsId,
          custom: true,
          administrators: data.administrators.map((admin) => ({
            firstName: admin.firstName,
            lastName: admin.lastName,
            username: admin.username,
            email: admin.email,
            password: admin.password!,
          })),
        })

        // Upload logo after organization is created
        if (logoFile && newOrganization) {
          const uploadedLogoUrl = await uploadLogoToS3(newOrganization.id)
          if (uploadedLogoUrl) {
            // Update organization with logo URL
            await updateMutation.mutateAsync({
              id: newOrganization.id,
              name: newOrganization.name,
              description: newOrganization.description || undefined,
              logoUrl: uploadedLogoUrl,
            })
          }
        }
      }
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const handleDelete = (organization: any) => {
    setSelectedOrganization(organization)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (selectedOrganization) {
      deleteMutation.mutate({ id: selectedOrganization.id })
    }
  }

  // Table columns
  const columns = useMemo(
    () => [
      {
        header: 'Company Name',
        accessorKey: 'name',
        cell: ({ row }: { row: { original: any } }) => {
          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-10 rounded-md bg-slate-100 dark:bg-slate-800">
                <Building2 className="size-5 text-slate-500" />
              </div>
              <div>
                <h6 className="mb-1">{row.original.name}</h6>
              </div>
            </div>
          )
        },
      },
      {
        header: 'Owner',
        cell: ({ row }: { row: { original: any } }) => {
          return (
            <div>
              <p className="mb-1">{row.original.owner?.name || 'N/A'}</p>
              <p className="text-slate-500 text-sm">
                {row.original.owner?.email || 'N/A'}
              </p>
            </div>
          )
        },
      },
      {
        header: 'Members',
        cell: ({ row }: { row: { original: any } }) => {
          const memberCount = row.original._count?.members || 0
          return (
            <div className="flex items-center gap-2">
              <Users className="size-4 text-slate-500" />
              <span>
                {memberCount} member{memberCount !== 1 ? 's' : ''}
              </span>
            </div>
          )
        },
      },
      {
        header: 'Projects',
        cell: ({ row }: { row: { original: any } }) => {
          const projectCount = row.original._count?.projects || 0
          return (
            <span>
              {projectCount} project{projectCount !== 1 ? 's' : ''}
            </span>
          )
        },
      },
      {
        header: 'Created At',
        cell: ({ row }: { row: { original: any } }) => {
          return new Date(row.original.createdAt).toLocaleDateString()
        },
      },
      {
        header: 'Actions',
        cell: ({ row }: { row: { original: any } }) => {
          return (
            <div className="flex gap-2">
              <button
                onClick={() => openEditModal(row.original)}
                className="btn btn-sub-gray btn-icon !size-8"
                title="Edit organization">
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => handleDelete(row.original)}
                className="btn btn-sub-red btn-icon !size-8"
                title="Delete organization">
                <Trash2 className="size-4" />
              </button>
            </div>
          )
        },
      },
    ],
    []
  )

  // Show loading while checking authentication
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  // Don't render if not SUPERADMIN (will redirect in useEffect)
  if (session?.user?.role !== 'SUPERADMIN') {
    return null
  }

  return (
    <React.Fragment>
      <BreadCrumb
        title="Organization Management"
        subTitle="Manage all organizations in the system (SuperAdmin only)"
      />

      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-5">
            <h6 className="text-15">Organizations</h6>
            <button
              type="button"
              className="btn btn-primary"
              onClick={openCreateModal}>
              <CirclePlus className="inline-block size-4 mr-1" />
              <span className="align-middle">Create Organization</span>
            </button>
          </div>

          <TableContainer
            isPagination={true}
            columns={columns || []}
            data={organizations || []}
            customPageSize={10}
            divClass="overflow-x-auto"
            tableClass="table flush"
            theadClass="ltr:text-left rtl:text-right"
            thClass="px-3.5 py-2.5 font-semibold text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
            tdClass="px-3.5 py-2.5"
            PaginationClassName="flex flex-col items-center mt-5 md:flex-row"
          />
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        id="organizationModal"
        position="modal-center"
        size="modal-lg"
        title={isEditMode ? 'Edit Organization' : 'Create New Organization'}
        content={
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-h-[80vh] overflow-y-auto pr-6">
            {!isEditMode && (
              <>
                {/* Logo Upload Section */}
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium">
                    Organization Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {logoPreview ? (
                      <div className="relative w-70 h-20 bg-gray-50 rounded-lg border flex items-center justify-center">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="max-w-full max-h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview(null)
                            setLogoFile(null)
                            setValue('logoUrl', '')
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                          <X className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-70 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Upload className="size-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleLogoSelect}
                        className="hidden"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="btn btn-outline-secondary btn-sm cursor-pointer inline-flex items-center">
                        <Upload className="size-4 mr-2" />
                        Upload Logo
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG or JPG. Recommended: 400px 100px.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Company Name */}
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter company name"
                    onChange={(e) => {
                      register('name').onChange(e)
                      // Auto-generate slug from company name
                      const slug = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                      setSlugValue(slug)
                      setValue('slug', slug)
                    }}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Slug */}
                <div className="mb-4">
                  <label
                    htmlFor="slug"
                    className="block mb-2 text-sm font-medium">
                    Organization Slug <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        id="slug"
                        {...register('slug')}
                        value={slugValue}
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase()
                          setSlugValue(value)
                          setValue('slug', value)
                        }}
                        className={`form-input ${errors.slug ? 'border-red-500' : ''}`}
                        placeholder="company-slug"
                      />
                      {errors.slug && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.slug.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Login URL: /auth/signin-basic/{slugValue || 'your-slug'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Allowed Pages (Menu Restrictions) */}
                <div className="mb-6">
                  <label className="block mb-3 text-sm font-medium">
                    Menu Restrictions
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Select which menu categories this organization can access
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      /* { value: 'dashboards', label: 'Dashboards' }, */
                      /*  { value: 'projects', label: 'Projects' },
                      { value: 'ecommerce', label: 'Ecommerce' }, */
                      { value: 'rrhh', label: 'RRHH' },
                      /*{ value: 'orders', label: 'Orders' },
                      { value: 'crm', label: 'CRM' },
                      { value: 'agents', label: 'Agents' },
                      { value: 'models', label: 'Models' }, */
                      { value: 'pqr', label: 'PQR' },
                      { value: 'forecasting', label: 'Forecasting' },
                      { value: 'nim-fraud', label: 'Nim Fraud' },
                      /* { value: 'api-keys', label: 'API Keys' }, */
                      /* { value: 'actions', label: 'Actions' }, */
                      { value: 'advisor', label: 'Digital Advisor' },
                      { value: 'leads', label: 'Leads' },
                      /* { value: 'chat', label: 'Chat' }, */

                      /*{ value: 'phone-numbers', label: 'Phone Numbers' },*/
                    ].map((page) => {
                      const allowedPages = watch('allowedPages') || []
                      const isChecked = allowedPages.includes(page.value)

                      return (
                        <label
                          key={page.value}
                          className="switch-group [&_.switch-wrapper]:h-5 [&_.switch-wrapper]:w-9 [&_.switch-dot]:h-4 [&_.switch-dot]:w-4 [&_.switch-dot]:top-[2px] [&_.switch-dot]:start-[2px]">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const currentPages = watch('allowedPages') || []
                                if (e.target.checked) {
                                  setValue('allowedPages', [
                                    ...currentPages,
                                    page.value,
                                  ])
                                } else {
                                  setValue(
                                    'allowedPages',
                                    currentPages.filter((p) => p !== page.value)
                                  )
                                }
                              }}
                              className="sr-only peer"
                            />
                            <div className="switch-wrapper peer-checked:bg-primary-500 peer-checked:border-primary-500"></div>
                            <div className="switch-dot peer-checked:translate-x-full rtl:peer-checked:-translate-x-full"></div>
                          </div>
                          <span className="ml-1">{page.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Agents Section - Dynamic based on Menu Restrictions */}
                <div className="mb-6">
                  <label className="block mb-3 text-sm font-medium">
                    Agents
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Assign global agents for each enabled page category
                  </p>

                  {(() => {
                    const allowedPages = watch('allowedPages') || []
                    const agentPages = ['pqr', 'rrhh', 'forecasting', 'advisor', 'leads']
                    const enabledAgentPages = allowedPages.filter((page) =>
                      agentPages.includes(page)
                    )

                    if (enabledAgentPages.length === 0) {
                      return (
                        <p className="text-sm text-gray-500 italic">
                          Enable PQR, RRHH, Forecasting, Digital Advisor, or Leads in Menu
                          Restrictions to assign agents
                        </p>
                      )
                    }

                    // Map pages to their agent configs
                    const pageAgentConfigs: { page: string; agents: Array<{ key: string; label: string; type: string }> }[] = []

                    enabledAgentPages.forEach((page) => {
                      if (page === 'rrhh') {
                        pageAgentConfigs.push({
                          page: 'rrhh',
                          agents: [
                            { key: 'agentRrhhId', label: 'RRHH Agent', type: 'rrhh' },
                            { key: 'agentRrhhChatId', label: 'RRHH Chat Agent', type: 'rrhhChat' }
                          ]
                        })
                      } else if (page === 'advisor') {
                        pageAgentConfigs.push({
                          page: 'advisor',
                          agents: [
                            { key: 'agentAdvisorId', label: 'Advisor Agent', type: 'advisor' },
                            { key: 'agentAdvisorChatId', label: 'Advisor Chat Agent', type: 'advisorChat' }
                          ]
                        })
                      } else if (page === 'pqr') {
                        pageAgentConfigs.push({
                          page: 'pqr',
                          agents: [
                            { key: 'agentPqrId', label: 'PQR Agent', type: 'pqr' }
                          ]
                        })
                      } else if (page === 'forecasting') {
                        pageAgentConfigs.push({
                          page: 'forecasting',
                          agents: [
                            { key: 'agentForecastingId', label: 'Forecasting Agent', type: 'forecasting' }
                          ]
                        })
                      } else if (page === 'leads') {
                        pageAgentConfigs.push({
                          page: 'leads',
                          agents: [
                            { key: 'agentLeadsId', label: 'Leads Agent', type: 'leads' }
                          ]
                        })
                      }
                    })

                    return (
                      <div className="space-y-3">
                        {pageAgentConfigs.flatMap((config) =>
                          config.agents.map((agentConfig) => {
                            const agentKey = agentConfig.key as
                              | 'agentPqrId'
                              | 'agentRrhhId'
                              | 'agentForecastingId'
                              | 'agentRrhhChatId'
                              | 'agentAdvisorChatId'
                              | 'agentAdvisorId'
                              | 'agentLeadsId'
                            const selectedAgentId = watch(agentKey)
                            const selectedAgent = allAgents.find(
                              (a) => a.id === selectedAgentId
                            )

                            return (
                              <div
                                key={agentConfig.key}
                                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                                <div className="flex-1">
                                  <span className="text-sm font-medium">
                                    {agentConfig.label}
                                  </span>
                                  {selectedAgent && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Selected: {selectedAgent.name}
                                      {selectedAgent.isGlobal && (
                                        <span className="ml-1 text-green-600">
                                          (Global)
                                        </span>
                                      )}
                                    </p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAgentType(agentConfig.type as any)
                                    setShowAgentModal(true)
                                  }}
                                  className="btn btn-outline-primary btn-md flex items-center">
                                  <CirclePlus className="w-4 h-4 mr-1" />
                                  Select
                                </button>
                              </div>
                            )
                          })
                        )}
                      </div>
                    )
                  })()}
                </div>

                {/* Administrators */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium">
                      Administrators <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        append({
                          firstName: '',
                          lastName: '',
                          username: '',
                          email: '',
                          password: '',
                        })
                      }
                      className="btn btn-sm btn-outline-primary flex items-center gap-3">
                      <Plus className="size-4 mr-1" />
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    First administrator will be assigned as OWNER, others as
                    ADMIN
                  </p>

                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-4 border rounded-lg mb-3 border-2 border-dashed  bg-gray-50 dark:bg-gray-800 border-gray-300">
                      <div className="flex items-center justify-between mb-3">
                        <h6 className="text-sm font-medium">
                          Administrator #{index + 1}
                          {index === 0 && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              OWNER
                            </span>
                          )}
                          {index > 0 && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              ADMIN
                            </span>
                          )}
                        </h6>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700">
                            <X className="size-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block mb-1 text-xs font-medium">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            {...register(`administrators.${index}.firstName`)}
                            className={`form-input ${errors.administrators?.[index]?.firstName
                              ? 'border-red-500'
                              : ''
                              }`}
                            placeholder="John"
                          />
                          {errors.administrators?.[index]?.firstName && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.administrators[index]?.firstName?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-medium">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            {...register(`administrators.${index}.lastName`)}
                            className={`form-input ${errors.administrators?.[index]?.lastName
                              ? 'border-red-500'
                              : ''
                              }`}
                            placeholder="Doe"
                          />
                          {errors.administrators?.[index]?.lastName && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.administrators[index]?.lastName?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-medium">
                            Username <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            {...register(`administrators.${index}.username`)}
                            className={`form-input ${errors.administrators?.[index]?.username
                              ? 'border-red-500'
                              : ''
                              }`}
                            placeholder="johndoe"
                          />
                          {errors.administrators?.[index]?.username && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.administrators[index]?.username?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-medium">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            {...register(`administrators.${index}.email`)}
                            className={`form-input ${errors.administrators?.[index]?.email
                              ? 'border-red-500'
                              : ''
                              }`}
                            placeholder="john@example.com"
                          />
                          {errors.administrators?.[index]?.email && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.administrators[index]?.email?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-medium">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            {...register(`administrators.${index}.password`)}
                            className={`form-input ${errors.administrators?.[index]?.password
                              ? 'border-red-500'
                              : ''
                              }`}
                            placeholder="••••••••"
                          />
                          {errors.administrators?.[index]?.password && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.administrators[index]?.password?.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {errors.administrators &&
                    typeof errors.administrators === 'object' &&
                    'root' in errors.administrators && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.administrators.root?.message}
                      </p>
                    )}
                </div>
              </>
            )}

            {isEditMode && (
              <>
                {/* Logo Upload Section */}
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium">
                    Organization Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {logoPreview ? (
                      <div className="relative w-70 h-20 bg-gray-50 rounded-lg border flex items-center justify-center">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="max-w-full max-h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview(null)
                            setLogoFile(null)
                            setValue('logoUrl', '')
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                          <X className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-70 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Upload className="size-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        id="logo-upload-edit"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleLogoSelect}
                        className="hidden"
                      />
                      <label
                        htmlFor="logo-upload-edit"
                        className="btn btn-outline-secondary btn-sm cursor-pointer inline-flex items-center">
                        <Upload className="size-4 mr-2" />
                        Upload Logo
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG or JPG. Recommended: 400px 100px.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Company Name */}
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter company name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Slug */}
                <div className="mb-4">
                  <label
                    htmlFor="slug"
                    className="block mb-2 text-sm font-medium">
                    Organization Slug <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        id="slug"
                        {...register('slug')}
                        value={slugValue}
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase()
                          setSlugValue(value)
                          setValue('slug', value)
                        }}
                        className={`form-input ${errors.slug ? 'border-red-500' : ''}`}
                        placeholder="company-slug"
                      />
                      {errors.slug && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.slug.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Login URL: /auth/signin-basic/{slugValue || 'your-slug'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Allowed Pages (Menu Restrictions) */}
                <div className="mb-6">
                  <label className="block mb-3 text-sm font-medium">
                    Menu Restrictions
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Select which menu categories this organization can access
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      /* { value: 'dashboards', label: 'Dashboards' }, */
                      /*  { value: 'projects', label: 'Projects' },
                      { value: 'ecommerce', label: 'Ecommerce' }, */
                      { value: 'rrhh', label: 'RRHH' },
                      /*{ value: 'orders', label: 'Orders' },
                      { value: 'crm', label: 'CRM' },
                      { value: 'agents', label: 'Agents' },
                      { value: 'models', label: 'Models' }, */
                      { value: 'pqr', label: 'PQR' },
                      { value: 'forecasting', label: 'Forecasting' },
                      { value: 'nim-fraud', label: 'Nim Fraud' },
                      /* { value: 'api-keys', label: 'API Keys' }, */
                      /* { value: 'actions', label: 'Actions' }, */
                      { value: 'advisor', label: 'Digital Advisor' },
                      { value: 'leads', label: 'Leads' },
                      /* { value: 'chat', label: 'Chat' }, */

                      /*{ value: 'phone-numbers', label: 'Phone Numbers' },*/
                    ].map((page) => {
                      const allowedPages = watch('allowedPages') || []
                      const isChecked = allowedPages.includes(page.value)

                      return (
                        <label
                          key={page.value}
                          className="switch-group [&_.switch-wrapper]:h-5 [&_.switch-wrapper]:w-9 [&_.switch-dot]:h-4 [&_.switch-dot]:w-4 [&_.switch-dot]:top-[2px] [&_.switch-dot]:start-[2px]">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const currentPages = watch('allowedPages') || []
                                if (e.target.checked) {
                                  setValue('allowedPages', [
                                    ...currentPages,
                                    page.value,
                                  ])
                                } else {
                                  setValue(
                                    'allowedPages',
                                    currentPages.filter((p) => p !== page.value)
                                  )
                                }
                              }}
                              className="sr-only peer"
                            />
                            <div className="switch-wrapper peer-checked:bg-primary-500 peer-checked:border-primary-500"></div>
                            <div className="switch-dot peer-checked:translate-x-full rtl:peer-checked:-translate-x-full"></div>
                          </div>
                          <span className="text-sm">{page.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Administrators */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium">
                      Administrators <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        append({
                          isExisting: false,
                          toDelete: false,
                          firstName: '',
                          lastName: '',
                          username: '',
                          email: '',
                          password: '',
                        })
                      }
                      className="btn btn-sm btn-outline-primary flex gap-3 items-center">
                      <Plus className="size-4 mr-1" />
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Add or manage administrators for this organization
                  </p>

                  {/* Agents Section - Dynamic based on Menu Restrictions */}
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <label className="block mb-3 text-sm font-medium">
                      Agents
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Assign global agents for each enabled page category
                    </p>

                    {(() => {
                      const allowedPages = watch('allowedPages') || []
                      const agentPages = ['pqr', 'rrhh', 'forecasting', 'advisor', 'leads']
                      const enabledAgentPages = allowedPages.filter((page) =>
                        agentPages.includes(page)
                      )

                      if (enabledAgentPages.length === 0) {
                        return (
                          <p className="text-sm text-gray-500 italic">
                            Enable PQR, RRHH, Forecasting, Digital Advisor, or Leads in Menu
                            Restrictions to assign agents
                          </p>
                        )
                      }

                      // Map pages to their agent configs
                      const pageAgentConfigs: { page: string; agents: Array<{ key: string; label: string; type: string }> }[] = []

                      enabledAgentPages.forEach((page) => {
                        if (page === 'rrhh') {
                          pageAgentConfigs.push({
                            page: 'rrhh',
                            agents: [
                              { key: 'agentRrhhId', label: 'RRHH Agent', type: 'rrhh' },
                              { key: 'agentRrhhChatId', label: 'RRHH Chat Agent', type: 'rrhhChat' }
                            ]
                          })
                        } else if (page === 'advisor') {
                          pageAgentConfigs.push({
                            page: 'advisor',
                            agents: [
                              { key: 'agentAdvisorId', label: 'Advisor Agent', type: 'advisor' },
                              { key: 'agentAdvisorChatId', label: 'Advisor Chat Agent', type: 'advisorChat' }
                            ]
                          })
                        } else if (page === 'pqr') {
                          pageAgentConfigs.push({
                            page: 'pqr',
                            agents: [
                              { key: 'agentPqrId', label: 'PQR Agent', type: 'pqr' }
                            ]
                          })
                        } else if (page === 'forecasting') {
                          pageAgentConfigs.push({
                            page: 'forecasting',
                            agents: [
                              { key: 'agentForecastingId', label: 'Forecasting Agent', type: 'forecasting' }
                            ]
                          })
                        } else if (page === 'leads') {
                          pageAgentConfigs.push({
                            page: 'leads',
                            agents: [
                              { key: 'agentLeadsId', label: 'Leads Agent', type: 'leads' }
                            ]
                          })
                        }
                      })

                      return (
                        <div className="space-y-3">
                          {pageAgentConfigs.flatMap((config) =>
                            config.agents.map((agentConfig) => {
                              const agentKey = agentConfig.key as
                                | 'agentPqrId'
                                | 'agentRrhhId'
                                | 'agentForecastingId'
                                | 'agentRrhhChatId'
                                | 'agentAdvisorChatId'
                                | 'agentAdvisorId'
                                | 'agentLeadsId'
                              const selectedAgentId = watch(agentKey)
                              const selectedAgent = allAgents.find(
                                (a) => a.id === selectedAgentId
                              )

                              return (
                                <div
                                  key={agentConfig.key}
                                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
                                  <div className="flex-1">
                                    <span className="text-sm font-medium">
                                      {agentConfig.label}
                                    </span>
                                    {selectedAgent && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Selected: {selectedAgent.name}
                                        {selectedAgent.isGlobal && (
                                          <span className="ml-1 text-green-600">
                                            (Global)
                                          </span>
                                        )}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedAgentType(agentConfig.type as any)
                                      setShowAgentModal(true)
                                    }}
                                    className="btn btn-md btn-outline-primary flex items-center">
                                    <CirclePlus className="w-4 h-4 mr-1" />
                                    Select
                                  </button>
                                </div>
                              )
                            })
                          )}
                        </div>
                      )
                    })()}
                  </div>

                  {fields.map((field: any, index) => {
                    const admin = watch(`administrators.${index}`)
                    const isExisting = admin?.isExisting

                    return (
                      <div
                        key={field.id}
                        className="p-4 border rounded-lg mb-3 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="text-sm font-medium">
                            {isExisting
                              ? 'Existing Administrator'
                              : `New Administrator #${index + 1}`}
                            {admin?.role === 'OWNER' && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                OWNER
                              </span>
                            )}
                            {admin?.role === 'ADMIN' && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                ADMIN
                              </span>
                            )}
                          </h6>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700">
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block mb-1 text-xs font-medium">
                              First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              {...register(`administrators.${index}.firstName`)}
                              disabled={isExisting}
                              className={`form-input ${isExisting ? 'bg-gray-100 dark:bg-gray-700' : ''} ${errors.administrators?.[index]?.firstName
                                ? 'border-red-500'
                                : ''
                                }`}
                              placeholder="John"
                            />
                            {errors.administrators?.[index]?.firstName && (
                              <p className="mt-1 text-xs text-red-600">
                                {
                                  errors.administrators[index]?.firstName
                                    ?.message
                                }
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block mb-1 text-xs font-medium">
                              Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              {...register(`administrators.${index}.lastName`)}
                              disabled={isExisting}
                              className={`form-input ${isExisting ? 'bg-gray-100 dark:bg-gray-700' : ''} ${errors.administrators?.[index]?.lastName
                                ? 'border-red-500'
                                : ''
                                }`}
                              placeholder="Doe"
                            />
                            {errors.administrators?.[index]?.lastName && (
                              <p className="mt-1 text-xs text-red-600">
                                {
                                  errors.administrators[index]?.lastName
                                    ?.message
                                }
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block mb-1 text-xs font-medium">
                              Username <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              {...register(`administrators.${index}.username`)}
                              disabled={isExisting}
                              className={`form-input ${isExisting ? 'bg-gray-100 dark:bg-gray-700' : ''} ${errors.administrators?.[index]?.username
                                ? 'border-red-500'
                                : ''
                                }`}
                              placeholder="johndoe"
                            />
                            {errors.administrators?.[index]?.username && (
                              <p className="mt-1 text-xs text-red-600">
                                {
                                  errors.administrators[index]?.username
                                    ?.message
                                }
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block mb-1 text-xs font-medium">
                              Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              {...register(`administrators.${index}.email`)}
                              disabled={isExisting}
                              className={`form-input ${isExisting ? 'bg-gray-100 dark:bg-gray-700' : ''} ${errors.administrators?.[index]?.email
                                ? 'border-red-500'
                                : ''
                                }`}
                              placeholder="john@example.com"
                            />
                            {errors.administrators?.[index]?.email && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.administrators[index]?.email?.message}
                              </p>
                            )}
                          </div>

                          {!isExisting && (
                            <div>
                              <label className="block mb-1 text-xs font-medium">
                                Password <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="password"
                                {...register(
                                  `administrators.${index}.password`
                                )}
                                className={`form-input ${errors.administrators?.[index]?.password
                                  ? 'border-red-500'
                                  : ''
                                  }`}
                                placeholder="••••••"
                              />
                              {errors.administrators?.[index]?.password && (
                                <p className="mt-1 text-xs text-red-600">
                                  {
                                    errors.administrators[index]?.password
                                      ?.message
                                  }
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {errors.administrators &&
                    typeof errors.administrators === 'object' &&
                    'root' in errors.administrators && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.administrators.root?.message}
                      </p>
                    )}
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={closeModal}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  isSubmitting ||
                  isUploadingLogo ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }>
                {isUploadingLogo
                  ? 'Uploading logo...'
                  : isSubmitting ||
                    createMutation.isPending ||
                    updateMutation.isPending
                    ? 'Saving...'
                    : isEditMode
                      ? 'Update Organization'
                      : 'Create Organization'}
              </button>
            </div>
          </form>
        }
      />

      {/* Delete Modal */}
      {/* Agent Selection Modal */}
      <ModalSelectAgent
        isOpen={showAgentModal}
        onClose={() => {
          setShowAgentModal(false)
          setSelectedAgentType(null)
        }}
        agents={allAgents.filter((a) => a.isGlobal)}
        onSelect={(agentId) => {
          if (selectedAgentType) {
            const agentKeyMap: Record<string,
              | 'agentPqrId'
              | 'agentRrhhId'
              | 'agentForecastingId'
              | 'agentRrhhChatId'
              | 'agentAdvisorChatId'
              | 'agentAdvisorId'
              | 'agentLeadsId'> = {
              pqr: 'agentPqrId',
              rrhh: 'agentRrhhId',
              forecasting: 'agentForecastingId',
              rrhhChat: 'agentRrhhChatId',
              advisorChat: 'agentAdvisorChatId',
              advisor: 'agentAdvisorId',
              leads: 'agentLeadsId'
            }
            const agentKey = agentKeyMap[selectedAgentType]
            if (agentKey) {
              setValue(agentKey, agentId)
            }
          }
          setShowAgentModal(false)
          setSelectedAgentType(null)
        }}
        initialSelectedId={
          selectedAgentType ? (() => {
            const agentKeyMap: Record<string,
              | 'agentPqrId'
              | 'agentRrhhId'
              | 'agentForecastingId'
              | 'agentRrhhChatId'
              | 'agentAdvisorChatId'
              | 'agentAdvisorId'
              | 'agentLeadsId'> = {
              pqr: 'agentPqrId',
              rrhh: 'agentRrhhId',
              forecasting: 'agentForecastingId',
              rrhhChat: 'agentRrhhChatId',
              advisorChat: 'agentAdvisorChatId',
              advisor: 'agentAdvisorId',
              leads: 'agentLeadsId'
            }
            const key = agentKeyMap[selectedAgentType]
            return key ? watch(key) : null
          })() : null
        }
        title={`Select ${selectedAgentType?.toUpperCase()} Agent`}
        buttonText="Assign Agent"
      />

      <DeleteModal
        show={showDeleteModal}
        handleHide={() => setShowDeleteModal(false)}
        deleteModalFunction={confirmDelete}
        title="Delete Organization"
        message={
          selectedOrganization
            ? `Are you sure you want to delete the organization "${selectedOrganization.name}"? This will also delete all associated projects, agents, and data. This action cannot be undone.`
            : 'Are you sure you want to delete this organization?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
      />
    </React.Fragment>
  )
}

export default OrganizationManagementPage
