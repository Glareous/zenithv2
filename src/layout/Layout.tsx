'use client'

import React, { useCallback, useEffect, useState } from 'react'

import dynamic from 'next/dynamic'
import Head from 'next/head'
import { usePathname, useRouter } from 'next/navigation'

import { LAYOUT_TYPES, SIDEBAR_SIZE } from '@src/components/constants/layout'
import { menu } from '@src/data/Sidebar/menu'
import { adminMenu } from '@src/data/Sidebar/adminMenu'
import { MainMenu, MegaMenu, SubMenu } from '@src/dtos'
import { changeSettingModalOpen } from '@src/slices/layout/reducer'
import { changeHTMLAttribute, setNewThemeData } from '@src/slices/layout/utils'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { changeSidebarSize } from '@src/slices/thunk'
import { api } from '@src/trpc/react'
import { filterMenuByAllowedPages } from '@src/utils/filterMenu'
import { Menu } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useDispatch, useSelector } from 'react-redux'

import Footer from './Footer'
import Topbar from './Topbar'

const SidebarComponent = dynamic(() => import('./Sidebar'), {
  ssr: false, // Disable SSR for this component
})

const AgentSidebarComponent = dynamic(
  () =>
    import('@src/components/layout/AgentSidebar').then((mod) => ({
      default: mod.AgentSidebar,
    })),
  {
    ssr: false,
  }
)

const AgentMobileDrawerComponent = dynamic(
  () =>
    import('@src/components/layout/AgentSidebar').then((mod) => ({
      default: mod.AgentMobileDrawer,
    })),
  {
    ssr: false,
  }
)

export default function Layout({
  breadcrumbTitle,
  children,
}: {
  breadcrumbTitle?: string
  children: React.ReactNode
}) {
  const title = breadcrumbTitle
    ? ` ${breadcrumbTitle} | Zenith -  AI apps & Dashboard Template `
    : 'Zenith -  AI apps & Dashboard Template'
  const { status, data: session } = useSession()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
  const [isAgentSidebarCollapsed, setIsAgentSidebarCollapsed] = useState(false)
  const [isAgentMobileDrawerOpen, setIsAgentMobileDrawerOpen] = useState(false)

  // Detect if we're on an agent page and extract agent ID
  const isAgentPage =
    (pathname?.includes('/apps/agents/default/') ||
      pathname?.includes('/apps/pqr/pqr-agent/') ||
      pathname?.includes('/apps/rrhh/rrhh-agent/') ||
      pathname?.includes('/admin/agents/')) &&
    Boolean(pathname?.match(/\/[^/]+\/[^/]*$/))
  const agentId = isAgentPage
    ? pathname?.includes('/apps/pqr/pqr-agent/')
      ? pathname?.split('/')[4]  // For PQR agent routes
      : pathname?.includes('/apps/rrhh/rrhh-agent/')
        ? pathname?.split('/')[4]  // For RRHH agent routes
        : pathname?.includes('/admin/agents/')
          ? pathname?.split('/')[3]  // For admin agent routes
          : pathname?.split('/')[4]   // For regular agent routes
    : null

  const {
    layoutMode,
    layoutType,
    layoutWidth,
    layoutSidebar,
    layoutDarkModeClass,
    layoutSidebarColor,
    layoutDataColor,
    layoutDirection,
  } = useSelector((state: RootState) => state.Layout)
  const dispatch = useDispatch<AppDispatch>()

  // Auto-minimize main sidebar when entering agent pages
  useEffect(() => {
    if (isAgentPage) {
      // Minimize sidebar to small size instead of closing completely
      setNewThemeData('data-sidebar-size', SIDEBAR_SIZE.SMALL)
      changeHTMLAttribute('data-sidebar', SIDEBAR_SIZE.SMALL)
      dispatch(changeSidebarSize(SIDEBAR_SIZE.SMALL))
    }
  }, [isAgentPage, dispatch])
  const router = useRouter()
  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin-basic')
    }
  }, [status, router])

  useEffect(() => {
    // When the session is authenticated, store a flag in localStorage
    if (status === 'authenticated') {
      localStorage.setItem('wasLoggedIn', 'true')
    }
  }, [status])

  // Fetch user's organization to get menu restrictions
  const { data: userOrganization, isLoading: isLoadingOrganization } = api.organization.getUserOrganization.useQuery(
    undefined,
    {
      enabled: status === 'authenticated' && session?.user?.role !== 'SUPERADMIN',
    }
  )

  // Debug: Log organization data
  useEffect(() => {
    if (userOrganization) {
      console.log('User Organization:', userOrganization)
      console.log('Logo URL:', userOrganization.logoUrl)
    }
  }, [userOrganization])

  // Determine which menu to use based on user role
  const currentMenu = session?.user?.role === 'SUPERADMIN' ? adminMenu : menu
  const [searchSidebar, setSearchSidebar] = useState<MegaMenu[]>(currentMenu)
  const [searchValue, setSearchValue] = useState<string>('')
  const [baseFilteredMenu, setBaseFilteredMenu] = useState<MegaMenu[]>(currentMenu)

  // Update menu when session or organization changes
  useEffect(() => {
    let newMenu = session?.user?.role === 'SUPERADMIN' ? adminMenu : menu

    // Apply menu restrictions and update agent links for regular users
    if (session?.user?.role !== 'SUPERADMIN' && userOrganization) {
      newMenu = filterMenuByAllowedPages(
        menu,
        userOrganization.allowedPages,
        userOrganization as any
      )
    }

    setBaseFilteredMenu(newMenu)
    setSearchSidebar(newMenu)
  }, [session?.user?.role, userOrganization])
  const handleThemeSidebarSize = useCallback(() => {
    if (layoutType !== 'horizontal') {
      // Toggle between BIG and SMALL sidebar
      const newSize =
        layoutSidebar === SIDEBAR_SIZE.DEFAULT
          ? SIDEBAR_SIZE.SMALL
          : SIDEBAR_SIZE.DEFAULT
      setNewThemeData('data-sidebar-size', newSize)
      changeHTMLAttribute('data-sidebar', newSize)
      dispatch(changeSidebarSize(newSize))
    } else {
      // If layout is horizontal, always use default size
      setNewThemeData('data-sidebar-size', SIDEBAR_SIZE.DEFAULT)
      changeHTMLAttribute('data-sidebar', SIDEBAR_SIZE.DEFAULT)
      dispatch(changeSidebarSize(SIDEBAR_SIZE.DEFAULT))
    }
  }, [layoutType, layoutSidebar, dispatch])

  const toggleSidebar = () => {
    if (window.innerWidth < 1000) {
      // Toggle sidebar open/close for small screens
      setIsSidebarOpen((prev) => !prev)
      setNewThemeData('data-sidebar-size', SIDEBAR_SIZE.DEFAULT)
      changeHTMLAttribute('data-sidebar', SIDEBAR_SIZE.DEFAULT)
      dispatch(changeSidebarSize(SIDEBAR_SIZE.DEFAULT))
    } else {
      // On larger screens, toggle between big and small sidebar
      handleThemeSidebarSize()
    }
  }
  useEffect(() => {
    const handleResize = () => {
      // Update the sidebar state based on the window width
      setIsSidebarOpen(window.innerWidth >= 1024)
      if (
        layoutType === LAYOUT_TYPES.SEMIBOX ||
        layoutType === LAYOUT_TYPES.MODERN
      ) {
        if (window.innerWidth > 1000) {
          // Set the layout to the layoutType if screen size is greater than 1000px
          document.documentElement.setAttribute('data-layout', layoutType)
        } else {
          // Set to 'default' if screen size is 1000px or less
          document.documentElement.setAttribute('data-layout', 'default')
        }
      } else {
        // For other layouts, just set to layoutType, no need to check screen size
        document.documentElement.setAttribute('data-layout', layoutType)
      }
    }
    // Initial layout check on component mount
    handleResize()
    // Listen for window resize events
    window.addEventListener('resize', handleResize)
    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [layoutType]) // Only rerun the effect when layoutType changes

  // handle search menu
  const handleSearchClient = (value: string) => {
    setSearchValue(value)

    if (value.trim() !== '') {
      const filteredMenu: MegaMenu[] = baseFilteredMenu.filter((megaItem: MegaMenu) => {
        // Filter the first level: MegaMenu
        const isMegaMenuMatch =
          megaItem.title.toLowerCase().includes(value.toLowerCase()) ||
          megaItem.lang.toLowerCase().includes(value.toLowerCase())

        // Filter the second level: MainMenu (children of MegaMenu)
        const filteredMainMenu = megaItem.children?.filter(
          (mainItem: MainMenu) => {
            const isMainMenuMatch =
              mainItem.title.toLowerCase().includes(value.toLowerCase()) ||
              mainItem.lang.toLowerCase().includes(value.toLowerCase())

            // Filter the third level: SubMenu (children of MainMenu)
            const filteredSubMenu = mainItem.children?.filter(
              (subItem: SubMenu) => {
                return (
                  subItem.title.toLowerCase().includes(value.toLowerCase()) ||
                  subItem.lang.toLowerCase().includes(value.toLowerCase())
                )
              }
            )
            // If SubMenu matches or MainMenu matches, return the filtered item
            return (
              isMainMenuMatch || (filteredSubMenu && filteredSubMenu.length > 0)
            )
          }
        )
        // Return MegaMenu item if it matches or has any matching MainMenu children
        return (
          isMegaMenuMatch || (filteredMainMenu && filteredMainMenu.length > 0)
        )
      })

      setSearchSidebar(filteredMenu)
    } else {
      setSearchSidebar(baseFilteredMenu)
    }
  }

  const sidebarColors =
    (typeof document !== 'undefined' &&
      localStorage.getItem('data-sidebar-colors')) ||
    layoutSidebarColor

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('scroll-smooth', 'group')
      document.documentElement.setAttribute('data-mode', layoutMode)
      document.documentElement.setAttribute('data-colors', layoutDataColor)
      document.documentElement.setAttribute('lang', 'en')
      document.documentElement.setAttribute('data-layout', layoutType)
      document.documentElement.setAttribute('data-content-width', layoutWidth)
      document.documentElement.setAttribute(
        'data-sidebar',
        layoutType === 'horizontal' ? 'default' : layoutSidebar
      )
      document.documentElement.setAttribute(
        'data-sidebar-colors',
        layoutType === 'horizontal' ? 'light' : sidebarColors
      )
      document.documentElement.setAttribute(
        'data-nav-type',
        layoutDarkModeClass
      )
      document.documentElement.setAttribute('dir', layoutDirection)
    }
  }, [
    layoutMode,
    layoutType,
    layoutWidth,
    layoutSidebar,
    layoutSidebarColor,
    layoutDataColor,
    layoutDarkModeClass,
    layoutDirection,
    sidebarColors,
  ])

  // Special layout for agent pages
  if (isAgentPage && agentId) {
    return (
      <React.Fragment>
        <Head>
          <title>{title}</title>
          <meta
            name="description"
            content="Zenith is a  AI apps & Dashboard Template that supports 21 frameworks including HTML, React JS, React TS, Angular 18, Laravel 11, ASP.Net Core 8, MVC 5, Blazor, Node JS, Django, Flask, PHP, CakePHP, Symfony, CodeIgniter, Ajax & Yii and more. Perfect for developers and businesses."
          />
          <meta name="author" content="Cognitiva IA" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="" />
          <meta
            property="og:title"
            content="Zenith -  AI apps & Dashboard Template"
          />
          <meta
            property="og:description"
            content="Versatile and responsive admin templates supporting 21 frameworks. Includes features like charts, RTL, LTR, dark light modes, and more."
          />
          <meta property="twitter:url" content="" />
          <meta
            property="twitter:title"
            content="Zenith -  AI apps & Dashboard Template"
          />
          <meta
            property="twitter:description"
            content="Explore Zenith, an  AI apps & dashboard template offering support for 21 frameworks. Perfect for building professional, scalable web apps."
          />
          <meta
            name="keywords"
            content="admin dashboard template, admin template, TailwindCSS dashboard, react next admin,  AI apps, Next TypeScript Admin, 21 frameworks support, responsive dashboard, web application template, dark mode, RTL support, Vue, MVC, Blazor, PHP, Node.js, Django, Flask, Next JS Admin"
          />
        </Head>

        <Topbar
          searchMenu={(value: string) => handleSearchClient(value)}
          searchText={searchValue}
          toggleSidebar={toggleSidebar}
          disableToggle={isAgentPage}
          organization={userOrganization}
          isLoadingOrganization={isLoadingOrganization}
        />

        <div className="flex h-screen pl-16 pt-[74px] pb-[55px]">
          {/* Main sidebar */}
          <SidebarComponent
            searchSidebar={searchSidebar}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            organization={userOrganization}
            isLoadingOrganization={isLoadingOrganization}
          />

          {/* Agent sidebar - Desktop */}
          <div className="hidden lg:block ">
            <AgentSidebarComponent
              agentId={agentId}
              currentPath={pathname}
              isCollapsed={isAgentSidebarCollapsed}
              setIsCollapsed={setIsAgentSidebarCollapsed}
            />
          </div>

          {/* Mobile agent menu button */}
          <div className="lg:hidden fixed top-20 left-4 z-50">
            <button
              onClick={() => setIsAgentMobileDrawerOpen(true)}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile agent drawer */}
          <AgentMobileDrawerComponent
            agentId={agentId}
            currentPath={pathname}
            isOpen={isAgentMobileDrawerOpen}
            onClose={() => setIsAgentMobileDrawerOpen(false)}
          />

          {/* Main content */}
          <div className="flex-1 overflow-auto">
            {children}
            <Footer organization={userOrganization} />
          </div>
        </div>
      </React.Fragment>
    )
  }

  // Default layout for non-agent pages
  return (
    <React.Fragment>
      {/* Main topbar */}
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content="Zenith is a  AI apps & Dashboard Template that supports 21 frameworks including HTML, React JS, React TS, Angular 18, Laravel 11, ASP.Net Core 8, MVC 5, Blazor, Node JS, Django, Flask, PHP, CakePHP, Symfony, CodeIgniter, Ajax & Yii and more. Perfect for developers and businesses."
        />

        <meta name="author" content="Cognitiva IA" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="" />
        <meta
          property="og:title"
          content="Zenith -  AI apps & Dashboard Template"
        />
        <meta
          property="og:description"
          content="Versatile and responsive admin templates supporting 21 frameworks. Includes features like charts, RTL, LTR, dark light modes, and more."
        />
        <meta property="twitter:url" content="" />
        <meta
          property="twitter:title"
          content="Zenith -  AI apps & Dashboard Template"
        />
        <meta
          property="twitter:description"
          content="Explore Zenith, an  AI apps & dashboard template offering support for 21 frameworks. Perfect for building professional, scalable web apps."
        />
        <meta
          name="keywords"
          content="admin dashboard template, admin template, TailwindCSS dashboard, react next admin,  AI apps, Next TypeScript Admin, 21 frameworks support, responsive dashboard, web application template, dark mode, RTL support, Vue, MVC, Blazor, PHP, Node.js, Django, Flask, Next JS Admin"
        />
      </Head>

      <Topbar
        searchMenu={(value: string) => handleSearchClient(value)}
        searchText={searchValue}
        toggleSidebar={toggleSidebar}
        organization={userOrganization}
        isLoadingOrganization={isLoadingOrganization}
      />

      {/* sidebar */}
      <SidebarComponent
        searchSidebar={searchSidebar}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        organization={userOrganization}
        isLoadingOrganization={isLoadingOrganization}
      />

      <div className="relative min-h-screen group-data-[layout=boxed]:bg-white group-data-[layout=boxed]:rounded-md">
        <div className="page-wrapper pt-[calc(theme('spacing.topbar')_*_1.2)]">
          {children}
        </div>
        <Footer organization={userOrganization} />
      </div>
    </React.Fragment>
  )
}
