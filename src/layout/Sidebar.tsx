'use client'

import React, { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import avatarDefault from '@assets/images/avatar/avatar-default.jpg'
import logoSmDark from '@assets/images/logo-sm-dark.png'
import logoSm from '@assets/images/logo-sm-white.png'
import logoWhite from '@assets/images/logo-white.png'
import mainLogo from '@assets/images/main-logo.png'
import { LAYOUT_TYPES, SIDEBAR_SIZE } from '@src/components/constants/layout'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownPosition,
} from '@src/components/custom/dropdown/dropdown'
import { MainMenu, MegaMenu, SubMenu } from '@src/dtos'
import { setCurrentProject } from '@src/slices/project/reducer'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import {
  AlignStartVertical,
  BellDot,
  BookOpen,
  Bot,
  Box,
  Building2,
  Calendar,
  ChartBarBig,
  ChartScatter,
  ChevronDown,
  Clipboard,
  Dna,
  Feather,
  FileText,
  Folders,
  Gauge,
  Gem,
  Headset,
  Hospital,
  KeyRound,
  LifeBuoy,
  LogOut,
  Mail,
  Map,
  MessagesSquare,
  Monitor,
  PencilRuler,
  Phone,
  Presentation,
  RemoveFormatting,
  School,
  Settings,
  Shapes,
  ShoppingBag,
  Table2,
  TextQuote,
  TrendingDown,
  Trophy,
  UsersRound,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import SimpleBar from 'simplebar-react'

interface SidebarProps {
  searchSidebar: MegaMenu[]
  isSidebarOpen: boolean
  toggleSidebar: () => void
  organization?: {
    id: string
    name: string
    logoUrl: string | null
  } | null
  isLoadingOrganization?: boolean
}

const Sidebar = ({
  searchSidebar,
  isSidebarOpen,
  toggleSidebar,
  organization,
  isLoadingOrganization = false,
}: SidebarProps) => {
  const { t } = useTranslation()
  const [sidebarDropdownPosition, setSidebarDropdownPosition] =
    useState<DropdownPosition>('top-right')
  const router = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const { layoutType, layoutSidebar } = useSelector(
    (state: RootState) => state.Layout
  )
  const { data: session } = useSession()
  const dispatch = useDispatch()

  const { currentProject } = useSelector((state: RootState) => state.Project)

  const { data: fetchedProjects, isLoading: isProjectsLoading } =
    api.project.getAll.useQuery(
      { organizationId: session?.user?.defaultOrganization?.id },
      { enabled: !!session?.user?.defaultOrganization?.id }
    )

  // Función helper para serializar fechas
  const serializeProject = (project: any) => ({
    id: project.id,
    name: project.name,
    description: project.description ?? undefined,
    organizationId: project.organizationId,
    createdById: project.createdById,
    createdAt:
      project.createdAt instanceof Date
        ? project.createdAt.toISOString()
        : typeof project.createdAt === 'string'
          ? project.createdAt
          : new Date(project.createdAt).toISOString(),
    updatedAt:
      project.updatedAt instanceof Date
        ? project.updatedAt.toISOString()
        : typeof project.updatedAt === 'string'
          ? project.updatedAt
          : new Date(project.updatedAt).toISOString(),
  })

  // Set project as current based on localStorage or use first project as default
  useEffect(() => {
    if (
      fetchedProjects &&
      fetchedProjects.length > 0 &&
      !currentProject &&
      !isProjectsLoading
    ) {
      const savedProjectId = localStorage.getItem('selectedProjectId')
      let projectToSelect = fetchedProjects[0]

      if (savedProjectId) {
        const savedProject = fetchedProjects.find(
          (project) => project.id === savedProjectId
        )
        if (savedProject) {
          projectToSelect = savedProject
        }
      }

      const serializedProject = serializeProject(projectToSelect)
      dispatch(setCurrentProject(serializedProject))
    }
  }, [fetchedProjects, currentProject, dispatch, isProjectsLoading])

  // Handle project selection
  const handleProjectSelect = (project: any) => {
    const serializedProject = serializeProject(project)
    dispatch(setCurrentProject(serializedProject))
    localStorage.setItem('selectedProjectId', project.id)
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (layoutType === 'horizontal') {
      setSidebarDropdownPosition('')
    } else {
      setSidebarDropdownPosition('top-right')
    }
  }, [layoutType])

  const getLucideIcon = (icon: string, className: string) => {
    const icons: { [key: string]: React.ReactElement } = {
      gauge: <Gauge className={className} />,
      box: <Box className={className} />,
      'building-2': <Building2 className={className} />,
      'messages-square': <MessagesSquare className={className} />,
      calendar: <Calendar className={className} />,
      mail: <Mail className={className} />,
      'shopping-bag': <ShoppingBag className={className} />,
      folders: <Folders className={className} />,
      monitor: <Monitor className={className} />,
      shapes: <Shapes className={className} />,
      trophy: <Trophy className={className} />,
      hospital: <Hospital className={className} />,
      school: <School className={className} />,
      'file-text': <FileText className={className} />,
      'users-round': <UsersRound className={className} />,
      'align-start-vertical': <AlignStartVertical className={className} />,
      'key-round': <KeyRound className={className} />,
      gem: <Gem className={className} />,
      'pencil-ruler': <PencilRuler className={className} />,
      'book-open': <BookOpen className={className} />,
      'remove-formatting': <RemoveFormatting className={className} />,
      clipboard: <Clipboard className={className} />,
      'text-quote': <TextQuote className={className} />,
      'table-2': <Table2 className={className} />,
      'bar-chart-3': <ChartBarBig className={className} />,
      'trending-up-down': <TrendingDown className={className} />,
      dna: <Dna className={className} />,
      'scatter-chart': <ChartScatter className={className} />,
      map: <Map className={className} />,
      'life-buoy': <LifeBuoy className={className} />,
      'file-textt': <FileText className={className} />,
      feather: <Feather className={className} />,
      bot: <Bot className={className} />,
      phone: <Phone className={className} />,
    }
    return icons[icon]
  }

  const isActive = (menuItem: MegaMenu | MainMenu | SubMenu): boolean => {
    if (menuItem.link === router) return true
    if (!menuItem.children) return false
    return menuItem.children.some((child) => {
      if (child.link === router) return true
      if (child.children && child.children.length > 0) return isActive(child)
      return false
    })
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  if (session) {
    return (
      <>
        {isSidebarOpen === true && (
          <>
            <div
              id="main-sidebar"
              className={`main-sidebar group-data-[layout=boxed]:top-[calc(theme('spacing.topbar')_+_theme('spacing.sidebar-boxed'))]  lg:block ${scrolled ? 'group-data-[layout=boxed]:!top-topbar' : 'scrolled'
                }`}>
              {/* Sidebar content goes here */}
              <div className="sidebar-wrapper">
                <div>
                  <div className="navbar-brand">
                    <Link
                      href="#!"
                      className="inline-flex items-center justify-center w-full">
                      {/* Show skeleton while loading */}
                      {isLoadingOrganization ? (
                        <>
                          <div className="group-data-[sidebar=small]:hidden">
                            <div className="h-8 w-32 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                          <div className="hidden group-data-[sidebar=small]:inline-block">
                            <div className="h-6 w-6 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                        </>
                      ) : organization?.logoUrl ? (
                        <>
                          <div className="group-data-[sidebar=small]:hidden">
                            <Image
                              src={organization.logoUrl}
                              aria-label={organization.name}
                              alt={organization.name}
                              className="h-8 mx-auto object-contain"
                              width={132}
                              height={32}
                            />
                          </div>
                          <div className="hidden group-data-[sidebar=small]:inline-block">
                            <Image
                              src={organization.logoUrl}
                              aria-label={organization.name}
                              alt={organization.name}
                              className="h-6 w-6 mx-auto object-contain"
                              width={24}
                              height={24}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Default logos */}
                          <div className="group-data-[sidebar=small]:hidden">
                            <Image
                              src={mainLogo}
                              aria-label="logo"
                              alt="logo"
                              className="h-6 mx-auto group-data-[sidebar-colors=light]:dark:hidden group-data-[sidebar-colors=dark]:hidden group-data-[sidebar-colors=brand]:hidden group-data-[sidebar-colors=purple]:hidden group-data-[sidebar-colors=sky]:hidden"
                              width={132}
                              height={24}
                            />
                            <Image
                              src={logoWhite}
                              aria-label="logo"
                              alt="logo"
                              className="h-6 mx-auto group-data-[sidebar-colors=light]:hidden group-data-[sidebar-colors=light]:dark:inline-block"
                              width={132}
                              height={24}
                            />
                          </div>
                          <div className="hidden group-data-[sidebar=small]:inline-block">
                            <Image
                              src={logoSmDark}
                              aria-label="logo"
                              alt="logo"
                              className="h-6 mx-auto group-data-[sidebar-colors=light]:dark:hidden group-data-[sidebar-colors=dark]:hidden group-data-[sidebar-colors=brand]:hidden group-data-[sidebar-colors=purple]:hidden group-data-[sidebar-colors=sky]:hidden"
                              width={24}
                              height={24}
                            />
                            <Image
                              src={logoSm}
                              aria-label="logo"
                              alt="logo"
                              className="h-6 mx-auto group-data-[sidebar-colors=light]:hidden group-data-[sidebar-colors=light]:dark:inline-block"
                              width={24}
                              height={24}
                            />
                          </div>
                        </>
                      )}
                    </Link>
                  </div>
                  {/* Project selector - only show for non-SUPERADMIN users */}
                  {session?.user?.role !== 'SUPERADMIN' && (
                    <div className="relative group-data-[layout=horizontal]:hidden group-data-[sidebar=small]:w-full">
                      {isProjectsLoading ? (
                        <div className="flex items-center w-full gap-2 p-4 group-data-[sidebar=small]:px-0">
                          <div className="h-10 w-10 rounded-md shrink-0 group-data-[sidebar=small]:mx-auto bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          <div className="grow group-data-[sidebar=icon]:hidden group-data-[sidebar=small]:hidden space-y-2">
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                        </div>
                      ) : (
                        <div className="block dropdown">
                          <Dropdown
                            data-id="organization-projects-dropdown"
                            toggleSidebar={toggleSidebar}
                            position=""
                            trigger="click"
                            dropdownClassName="dropdown w-full">
                            <DropdownButton colorClass="flex items-center w-full gap-2 p-4 text-left group-data-[sidebar=small]:px-0">
                              <Monitor className="h-10 w-10 p-2 rounded-md shrink-0 group-data-[sidebar=small]:mx-auto bg-primary-50 text-primary-600" />
                              <div className="grow group-data-[sidebar=icon]:hidden group-data-[sidebar=small]:hidden overflow-hidden text-new-500">
                                <h6 className="font-medium truncate text-sidebar-text-active">
                                  {currentProject?.name ?? 'No Project Selected'}
                                </h6>
                                <p className="text-menu-title text-14">
                                  {currentProject
                                    ? `${fetchedProjects?.length ?? 0} projects`
                                    : 'Select a project'}
                                </p>
                              </div>
                              <div className="shrink-0 text-sidebar-text group-data-[sidebar=icon]:hidden group-data-[sidebar=small]:hidden group-data-[sidebar=medium]:hidden">
                                <ChevronDown className="size-4" />
                              </div>
                            </DropdownButton>
                            <DropdownMenu menuClass="z-50 p-5 bg-white rounded-md shadow-lg !w-64 !left-3 max-h-[500px] overflow-y-auto">
                              <div className="space-y-2">
                                {fetchedProjects && fetchedProjects.length > 0 ? (
                                  fetchedProjects.map((project) => (
                                    <button
                                      key={project.id}
                                      onClick={() => handleProjectSelect(project)}
                                      className={`w-full text-left p-2 rounded-md hover:bg-gray-50 ${currentProject?.id === project.id
                                        ? 'bg-primary-50 text-primary-600'
                                        : ''
                                        }`}>
                                      <div className="font-medium">
                                        {project.name}
                                      </div>
                                      {project.description && (
                                        <div className="text-sm text-gray-500 truncate">
                                          {project.description}
                                        </div>
                                      )}
                                    </button>
                                  ))
                                ) : (
                                  <div className="text-gray-500">
                                    No projects found
                                  </div>
                                )}
                              </div>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Project ID Display - only show for non-SUPERADMIN users */}
                  {session?.user?.role !== 'SUPERADMIN' && currentProject && (
                    <div className="px-4 py-2 group-data-[sidebar=small]:hidden">
                      <p className="text-xs text-gray-500 font-mono truncate">
                        ID: {currentProject.id}
                      </p>
                    </div>
                  )}
                </div>

                <div className="fixed top-0 bottom-0 left-0 w-10 bg-white bg-light hidden group-data-[layout=doulcolumn]:block"></div>
                <SimpleBar className="navbar-menu" id="navbar-menu-list">
                  <ul
                    className="group-data-[layout=horizontal]:md:flex group-data-[layout=horizontal]:*:shrink-0"
                    id="sidebar">
                    {isLoadingOrganization ? (
                      // Skeleton loaders for menu items
                      <>
                        {/* Menu section title skeleton */}
                        <li className="menu-title">
                          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse group-data-[sidebar=small]:hidden" />
                        </li>

                        {/* Menu item skeletons with varying widths */}
                        {[80, 100, 90, 85, 95, 75, 88, 92].map((width, index) => (
                          <li
                            key={`skeleton-${index}`}
                            className="relative group-data-[sidebar=small]:mb-3">
                            <div className="nav-link flex items-center gap-3 px-4 py-2.5">
                              {/* Icon skeleton */}
                              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse shrink-0 group-data-[sidebar=small]:w-full group-data-[sidebar=small]:flex group-data-[sidebar=small]:justify-center" />
                              {/* Text skeleton */}
                              <div
                                className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse group-data-[sidebar=small]:hidden"
                                style={{ width: `${width}px` }}
                              />
                            </div>
                          </li>
                        ))}

                        {/* Another section title skeleton */}
                        <li className="menu-title mt-2">
                          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse group-data-[sidebar=small]:hidden" />
                        </li>

                        {/* More menu item skeletons */}
                        {[85, 95, 78].map((width, index) => (
                          <li
                            key={`skeleton-2-${index}`}
                            className="relative group-data-[sidebar=small]:mb-3">
                            <div className="nav-link flex items-center gap-3 px-4 py-2.5">
                              {/* Icon skeleton */}
                              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse shrink-0 group-data-[sidebar=small]:w-full group-data-[sidebar=small]:flex group-data-[sidebar=small]:justify-center" />
                              {/* Text skeleton */}
                              <div
                                className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse group-data-[sidebar=small]:hidden"
                                style={{ width: `${width}px` }}
                              />
                            </div>
                          </li>
                        ))}
                      </>
                    ) : searchSidebar && searchSidebar.length > 0 ? (
                      searchSidebar.map((item: MegaMenu, index: number) => (
                        <li
                          key={index}
                          className={
                            item.separator
                              ? 'menu-title'
                              : 'relative group-data-[sidebar=small]:mb-3'
                          }>
                          {/* Check for separator */}
                          {!(item.children?.length ?? 0) &&
                            item.separator && (
                              <span className="group-data-[sidebar=small]:hidden">
                                {item.title}
                              </span>
                            )}

                          {/* If it has children */}
                          {!item.separator &&
                            (item.children ?? []).length > 0 && (
                              <Dropdown
                                position={sidebarDropdownPosition}
                                trigger="click"
                                isActive={
                                  layoutSidebar !== SIDEBAR_SIZE.SMALL
                                    ? isActive(item)
                                    : false
                                }
                                toggleSidebar={toggleSidebar}
                                closeOnOutsideClick={
                                  layoutType === LAYOUT_TYPES.HORIZONTAL ||
                                  layoutSidebar === SIDEBAR_SIZE.SMALL
                                }
                                closeOnOutsideClickSidebar={
                                  layoutType !== LAYOUT_TYPES.HORIZONTAL
                                }>
                                <DropdownButton
                                  colorClass={`nav-link group-data-[sidebar=small]:px-2.5 group-data-[sidebar=small]:py-2.5 group-data-[sidebar=small]:mx-0 group-data-[sidebar=small]:h-10 group-data-[sidebar=small]:w-full group-data-[sidebar=small]:flex group-data-[sidebar=small]:items-center group-data-[sidebar=small]:justify-center ${isActive(item) ? 'active' : ''
                                    }`}
                                  arrow={true}>
                                  <span className="w-6 group-data-[sidebar=small]:w-full group-data-[sidebar=small]:flex group-data-[sidebar=small]:justify-center shrink-0">
                                    {item.icon &&
                                      getLucideIcon(
                                        item.icon,
                                        'size-4 group-data-[sidebar=small]:size-9 group-data-[sidebar=medium]:size-9'
                                      )}
                                  </span>
                                  <span className="group-data-[sidebar=small]:hidden">
                                    {item.title}
                                  </span>
                                </DropdownButton>

                                <DropdownMenu
                                  handleMenuClick={handleMenuClick}
                                  sidebar={true}>
                                  <ul className="dropdown-wrapper">
                                    {(item.children ?? []).map(
                                      (
                                        child: MegaMenu,
                                        childIndex: number
                                      ) => (
                                        <li key={childIndex}>
                                          {/* Check for nested children */}
                                          {child.children &&
                                            child.children.length > 0 ? (
                                            <Dropdown
                                              position="top-right"
                                              trigger="click"
                                              isActive={isActive(child)}
                                              closeOnOutsideClick={
                                                layoutType ===
                                                LAYOUT_TYPES.HORIZONTAL ||
                                                layoutSidebar ===
                                                SIDEBAR_SIZE.SMALL
                                              }
                                              closeOnOutsideClickSidebar={
                                                layoutType !==
                                                LAYOUT_TYPES.HORIZONTAL
                                              }>
                                              <DropdownButton
                                                colorClass={`nav-link ${isActive(child)
                                                  ? 'active'
                                                  : ''
                                                  }`}
                                                arrow={true}>
                                                <span>{child.title}</span>
                                              </DropdownButton>

                                              <DropdownMenu
                                                handleMenuClick={
                                                  handleMenuClick
                                                }
                                                sidebar={true}>
                                                <ul className="dropdown-wrapper">
                                                  {child.children.map(
                                                    (
                                                      subChild: MegaMenu,
                                                      subIndex: number
                                                    ) => (
                                                      <li key={subIndex}>
                                                        <Link
                                                          href={
                                                            subChild.link
                                                              ? subChild.link
                                                              : '#'
                                                          }
                                                          target={subChild.link?.startsWith('http') ? '_blank' : undefined}
                                                          rel={subChild.link?.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                          className={`${router ===
                                                            subChild.link
                                                            ? 'active'
                                                            : ''
                                                            }`}>
                                                          {subChild.title}
                                                        </Link>
                                                      </li>
                                                    )
                                                  )}
                                                </ul>
                                              </DropdownMenu>
                                            </Dropdown>
                                          ) : (
                                            <Link
                                              href={child.link || '#'}
                                              target={child.link?.startsWith('http') ? '_blank' : undefined}
                                              rel={child.link?.startsWith('http') ? 'noopener noreferrer' : undefined}
                                              className={` content ${router === child.link
                                                ? 'active'
                                                : ''
                                                }`}>
                                              {t(child.lang)}
                                            </Link>
                                          )}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </DropdownMenu>
                              </Dropdown>
                            )}

                          {/* Simple link without children */}
                          {!item.separator &&
                            !(item.children?.length ?? 0) &&
                            item.link && (
                              <Link
                                href={item.link}
                                target={item.link.startsWith('http') ? '_blank' : undefined}
                                rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                                className={`nav-link flex items-center gap-2 group-data-[sidebar=small]:px-2 group-data-[sidebar=small]:py-2 group-data-[sidebar=small]:mx-0 group-data-[sidebar=small]:h-10 group-data-[sidebar=small]:w-full group-data-[sidebar=small]:justify-center ${router === item.link ? 'active' : ''
                                  }`}>
                                <span className="group-data-[sidebar=small]:w-full group-data-[sidebar=small]:flex group-data-[sidebar=small]:justify-center">
                                  {item.icon &&
                                    getLucideIcon(
                                      item.icon,
                                      'size-4 group-data-[sidebar=small]:size-5 group-data-[sidebar=medium]:size-9'
                                    )}
                                </span>
                                <span className="group-data-[sidebar=small]:hidden">
                                  {item.title}
                                </span>
                              </Link>
                            )}
                        </li>
                      ))
                    ) : (
                      ''
                    )}
                  </ul>
                </SimpleBar>
              </div>
            </div>
            <div
              id="backdrop"
              className="backdrop-overlay backdrop-blur-xs z-[1004] lg:hidden print:hidden"
              onClick={toggleSidebar}></div>
          </>
        )}
      </>
    )
  }
}

export default Sidebar
