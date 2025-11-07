'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import flagImg from '@assets/images/flag/us.svg'
import { interNationalization } from '@src/data'
import { InterNationalization } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { changeLayoutLanguage } from '@src/slices/thunk'
import i18n from '@src/utils/i18n'
import { useDispatch, useSelector } from 'react-redux'
import SimpleBar from 'simplebar-react'

import { LAYOUT_LANGUAGES } from '../constants/layout'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '../custom/dropdown/dropdown'

const LanguageDropdown = () => {
  const dispatch = useDispatch<AppDispatch>()

  const { layoutLanguages } = useSelector((state: RootState) => state.Layout)

  // get country flag
  const getCountryFlag = (code: string) => {
    return interNationalization.find((item) => item.code === code)?.flag
  }

  // change language
  const changeLanguage = (lng: LAYOUT_LANGUAGES) => {
    dispatch(changeLayoutLanguage(lng))
    i18n.changeLanguage(lng)
  }

  return (
    <div>
      <Dropdown position="right" trigger="click" dropdownClassName="dropdown">
        <DropdownButton colorClass="topbar-link">
          <Image
            src={getCountryFlag(layoutLanguages) || flagImg}
            alt="flagImg"
            className="object-cover rounded-md size-6"
            width={24}
            height={24}
          />
        </DropdownButton>

        <DropdownMenu>
          <SimpleBar className="max-h-[calc(100vh_-_100px)]">
            {interNationalization &&
              interNationalization.length > 0 &&
              interNationalization.map(
                (value: InterNationalization, key: number) => {
                  return (
                    <Link
                      href="#!"
                      className="dropdown-item"
                      key={key}
                      onClick={() => changeLanguage(value.code)}>
                      <Image
                        src={value.flag}
                        alt={value.language}
                        className="object-cover rounded-md size-5"
                        width={20}
                        height={20}
                      />
                      <span>{value.language}</span>
                    </Link>
                  )
                }
              )}
          </SimpleBar>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default LanguageDropdown
