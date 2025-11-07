import { FC, ReactElement } from 'react'

import { StaticImageData } from 'next/image'

import { LAYOUT_LANGUAGES } from '@src/components/constants/layout'

// Define the type for pages that use a custom layout
export type NextPageWithLayout = FC & {
  getLayout?: (page: ReactElement) => ReactElement
}

export interface InterNationalization {
  id: number
  language: string
  code: LAYOUT_LANGUAGES
  flag: string | StaticImageData
}

export interface MegaMenu {
  title: string
  lang: string
  icon?: string
  link?: string
  separator?: boolean
  dropdownPosition?: null
  children?: MainMenu[]
  megaMenu?: boolean
  isProjectIndependent?: boolean
}

export interface MainMenu {
  title: string
  lang: string
  link: string
  dropdownPosition?: null
  children?: SubMenu[]
}

export interface SubMenu {
  title: string
  lang: string
  link: string
  dropdownPosition?: null
  children: SubMenu[] // If submenus can be nested, otherwise use `children: []`
}
