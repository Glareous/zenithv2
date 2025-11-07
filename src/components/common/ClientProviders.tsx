'use client'

import { ReactNode, useEffect } from 'react'

import { initialState } from '@src/slices/layout/reducer'
import { getPreviousStorageData } from '@src/slices/layout/utils'
import store from '@src/slices/reducer'
import {
  changeDarkModeClass,
  changeDataColor,
  changeDirection,
  changeLayout,
  changeLayoutContentWidth,
  changeLayoutLanguage,
  changeLayoutMode,
  changeModernNavigation,
  changeSidebarColor,
  changeSidebarSize,
  getEcommerceShopCartData,
  getInvoiceListData,
  getOrderData,
  getPatientsData,
  getProductListData,
  getStudentListData,
  getWishList,
} from '@src/slices/thunk'
import { Provider } from 'react-redux'

import AuthContext from '../auth/SessionWrapper'
import {
  DARK_MODE_CLASS,
  DATA_COLORS,
  LAYOUT_CONTENT_WIDTH,
  LAYOUT_DIRECTION,
  LAYOUT_LANGUAGES,
  LAYOUT_MODE_TYPES,
  LAYOUT_TYPES,
  MODERN_NAVIGATION,
  SIDEBAR_COLOR,
  SIDEBAR_SIZE,
} from '../constants/layout'

interface ClientProvidersProps {
  children: ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  useEffect(() => {
    const htmlElement = document.documentElement
    htmlElement.classList.add('scroll-smooth', 'group')
    return () => {
      htmlElement.classList.remove('scroll-smooth', 'group')
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dispatch = store.dispatch
      dispatch(getEcommerceShopCartData())
      dispatch(getOrderData())
      dispatch(getInvoiceListData())
      dispatch(getWishList())
      dispatch(getPatientsData())
      dispatch(getStudentListData())
      dispatch(getProductListData())

      dispatch(
        changeLayoutMode(
          (getPreviousStorageData('data-layout-mode') as LAYOUT_MODE_TYPES) ??
            initialState.layoutMode
        )
      )
      dispatch(
        changeLayoutContentWidth(
          (getPreviousStorageData(
            'data-layout-content-width'
          ) as LAYOUT_CONTENT_WIDTH) ?? initialState.layoutWidth
        )
      )
      dispatch(
        changeSidebarSize(
          (getPreviousStorageData('data-sidebar-size') as SIDEBAR_SIZE) ??
            initialState.layoutSidebar
        )
      )
      dispatch(
        changeDirection(
          (getPreviousStorageData(
            'data-layout-direction'
          ) as LAYOUT_DIRECTION) ?? initialState.layoutDirection
        )
      )
      dispatch(
        changeLayout(
          (getPreviousStorageData('data-layout-type') as LAYOUT_TYPES) ??
            initialState.layoutType
        )
      )
      dispatch(
        changeSidebarColor(
          (getPreviousStorageData('data-sidebar-colors') as SIDEBAR_COLOR) ??
            initialState.layoutSidebarColor
        )
      )
      dispatch(
        changeLayoutLanguage(
          Object.values(LAYOUT_LANGUAGES).includes(
            getPreviousStorageData('data-layout-language') as LAYOUT_LANGUAGES
          )
            ? (getPreviousStorageData(
                'data-layout-language'
              ) as LAYOUT_LANGUAGES)
            : LAYOUT_LANGUAGES.ENGLISH
        )
      )
      dispatch(
        changeDataColor(
          (getPreviousStorageData('data-theme-color') as DATA_COLORS) ??
            initialState.layoutDataColor
        )
      )
      dispatch(
        changeDarkModeClass(
          (getPreviousStorageData(
            'data-theme-dark-class'
          ) as DARK_MODE_CLASS) ?? initialState.layoutDarkModeClass
        )
      )
      dispatch(
        changeModernNavigation(
          (getPreviousStorageData(
            'data-theme-nav-type'
          ) as MODERN_NAVIGATION) ?? initialState.layoutNavigation
        )
      )
    }
  }, [])
  return (
    <AuthContext>
      <Provider store={store}>{children}</Provider>{' '}
    </AuthContext>
  )
}
