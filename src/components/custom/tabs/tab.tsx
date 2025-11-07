'use client'

import React, { ReactNode, useEffect, useState } from 'react'

import { usePathname, useRouter } from 'next/navigation'

interface TabsProps {
  children: React.ReactNode
  ulProps?: string
  activeTabClass?: string
  inactiveTabClass?: string
  otherClass?: string
  contentProps?: string
  liprops?: string
  spanProps?: string
  onChange?: (tab: string) => void
  defaultActiveTab?: number
  activeTab?: number // Controlled mode
  onTabChange?: (index: number) => void // Controlled mode
}

const Tabs: React.FC<TabsProps> = ({
  children,
  ulProps = '',
  activeTabClass = '',
  inactiveTabClass = '',
  otherClass = '',
  contentProps = '',
  liprops = '',
  spanProps = '',
  onChange,
  defaultActiveTab = 0,
  activeTab: controlledActiveTab,
  onTabChange,
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const [internalActiveTab, setInternalActiveTab] = useState<number>(defaultActiveTab)

  // Use controlled value if provided, otherwise use internal state
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab

  const tabs = React.Children.toArray(
    children
  ) as React.ReactElement<TabProps>[]

  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.props.path === pathname)
    if (activeIndex !== -1) {
      if (controlledActiveTab === undefined) {
        setInternalActiveTab(activeIndex)
      }
    } else if (defaultActiveTab !== 0 && controlledActiveTab === undefined) {
      setInternalActiveTab(defaultActiveTab)
    }
  }, [pathname, tabs, defaultActiveTab, controlledActiveTab])

  const handleTabClick = (index: number, path?: string) => {
    // If controlled mode, call the callback
    if (onTabChange) {
      onTabChange(index)
    } else {
      // Otherwise use internal state
      setInternalActiveTab(index)
    }

    if (path) {
      router.push(path)
    }

    const label = tabs[index].props.label
    if (label && onChange) {
      onChange(String(label))
    }
  }

  return (
    <>
      <ul className={`${ulProps}`}>
        {tabs.map((tab, index) => (
          <li
            key={index}
            onClick={() => handleTabClick(index, tab.props.path)}
            className={`${liprops}`}
            style={{ cursor: 'pointer' }}>
            <span
              className={`${activeTab === index ? activeTabClass : inactiveTabClass} ${otherClass}`}>
              {tab.props.icon}
              <span className={`${spanProps}`}>{tab.props.label}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className={contentProps}>{tabs[activeTab].props.children}</div>
    </>
  )
}

interface TabProps {
  label: string | ReactNode
  icon?: ReactNode
  path?: string
  children?: ReactNode
}

const Tab: React.FC<TabProps> = ({ children }) => {
  return <>{children}</>
}

export { Tabs, Tab }
