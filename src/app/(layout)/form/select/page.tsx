'use client'

import React, { useState } from 'react'

import BreadCrumb from '@src/components/common/BreadCrumb'
import { NextPageWithLayout } from '@src/dtos'
import Select, { GroupBase, MultiValue, StylesConfig } from 'react-select'
import CreatableSelect from 'react-select/creatable'

interface OptionType {
  value: number | string
  label: string
  description?: string
  classNames?: string
  isDisabled?: boolean
  alias?: string | string[]
}

function getOptions(count = 10, includeDesc = false): OptionType[] {
  const optionsData: OptionType[] = []
  for (let i = 1; i <= count; i += 1) {
    const optionData: OptionType = { value: i, label: `Option ${i}` }
    if (includeDesc) {
      optionData.description = `Description ${i}`
    }
    optionsData.push(optionData)
  }
  return optionsData
}

interface OptionTypes {
  label: string
  value: string
}

// Define the grouped options type
type GroupedOptionType = GroupBase<OptionTypes>

const groupedOptions: GroupedOptionType[] = [
  {
    label: 'Option Group 1',
    options: [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
      { label: 'Option 4', value: '4' },
      { label: 'Option 5', value: '5' },
      { label: 'Option 6', value: '6' },
      { label: 'Option 7', value: '7' },
      { label: 'Option 8', value: '8' },
    ],
  },
  {
    label: 'Option Group 2',
    options: [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
      { label: 'Option 4', value: '4' },
      { label: 'Option 5', value: '5' },
      { label: 'Option 6', value: '6' },
      { label: 'Option 7', value: '7' },
      { label: 'Option 8', value: '8' },
    ],
  },
]

// Define the native select options
const nativeOptions: OptionType[] = [
  { value: '1', label: 'Option 1', isDisabled: true },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
  { value: '4', label: 'Option 4' },
  { value: '5', label: 'Option 5' },
  { value: '6', label: 'Option 6' },
]

// ----------- alias for search -------------
const aliasoptions: OptionType[] = [
  { label: 'Colors', value: 'colors', alias: 'Orange, Red' },
  { label: 'Fruits', value: 'fruits', alias: ['Orange', 'Apple'] },
  { label: 'Months', value: 'months', alias: 'January' },
  { label: 'Others', value: 'others' },
]

// ----------- sample image ------------
const ImageOptions: OptionType[] = [
  {
    label: 'Options 1',
    value: '1',
    description: 'Description 1',
    classNames: 'fo',
  },
  {
    label: 'Options 2',
    value: '2',
    description: 'Description 2',
    classNames: 'nz',
  },
  {
    label: 'Options 3',
    value: '3',
    description: 'Description 3',
    classNames: 'bi',
  },
]

type NativeOptionType = OptionType

// Highlight matched text in search results
const highlightText = (text: string, search: string) => {
  if (!search) return text
  const parts = text.split(new RegExp(`(${search})`, 'gi'))
  return parts.map((part, index) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <mark key={index}>{part}</mark>
    ) : (
      part
    )
  )
}

// Custom sorting function to show selected options first
const sortOptions = (
  options: OptionType[],
  selectedOptions: OptionType[] | null
) => {
  if (!selectedOptions) return options

  const selectedValues = selectedOptions.map((option) => option.value)

  return [...options].sort((a, b) => {
    const aSelected = selectedValues.includes(a.value) ? -1 : 1
    const bSelected = selectedValues.includes(b.value) ? -1 : 1
    return aSelected - bSelected
  })
}

const SelectPage: NextPageWithLayout = () => {
  // ----------- default ------------
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null)
  const [selectedSearchOption, setSelectedSearchOption] =
    useState<OptionType | null>(null)
  const [selectedMultiOption, setSelectedMultiOption] = useState<
    MultiValue<OptionType>
  >([])

  // ------------ multi without search ------------
  const [selectedMultiWithOutOption, setSelectedMultiWithOutOption] = useState<
    MultiValue<OptionType>
  >([])
  // ----------- disable ------------
  const [selectedDisableOption, setSelectedDisableOption] =
    useState<OptionType | null>(null)
  // ----------- option group ------------
  const [selectedGroupOption, setSelectedGroupOption] = useState<
    MultiValue<OptionTypes>
  >([])
  // ------------- preselect -----------
  const selectedOptionValue = [3]
  const disabledOptions = [2, 6, 8]
  const [selectedPresetOption, setSelectedPresetOption] = useState<
    MultiValue<OptionType>
  >(
    getOptions(8).filter((option) =>
      selectedOptionValue.includes(option.value as number)
    )
  )
  const [selectedNativeOption, setSelectedNativeOption] =
    useState<NativeOptionType | null>(
      nativeOptions.find((option) => option.value === '4') || null
    )
  // ------------- preselect Multi -----------
  const selectedMultiOptions = [3, 4]

  useState<NativeOptionType | null>(
    nativeOptions.find((option) => (option.value as number) === 4) || null
  )

  const [selectedPresetMultiOption, setSelectedPresetMultiOption] = useState<
    MultiValue<OptionType>
  >(
    getOptions(8).filter((option) =>
      selectedMultiOptions.includes(option.value as number)
    )
  )
  // ------------ hide clear button ------------
  const [selectedHideOption, setSelectedHideOption] =
    useState<OptionType | null>(null)

  // ------------ custom width -------------
  const [selectedWidthOption, setSelectedWidthOption] =
    useState<OptionType | null>(null)
  // ------------ allow to add new -------------
  const [selectedNewOption, setSelectedNewOption] = useState<OptionType | null>(
    null
  )

  const [options, setOptions] = useState<OptionType[]>(getOptions(8))
  // ------------- Mark matched -------------
  const [selectedmarkOption, setSelectedmarkOption] =
    useState<OptionType | null>(null)
  // ----------- show selected ---------------
  const [selectedshowOption, setSelectedshowOption] = useState<
    MultiValue<OptionType>
  >([])

  // ------------ maximum option -------------
  const [selectedOptions, setSelectedOptions] = useState<
    MultiValue<OptionType>
  >([])
  const MAX_SELECTION = 4
  // ----------- description -----------
  const [selecteddescriptionOption, setSelecteddescriptionOption] =
    useState<OptionType | null>(null)
  // ----------- show on search ------------
  const [menuIsOpen, setMenuIsOpen] = useState(false)

  // -------- value as tag -----------
  const [selectedValueOptions, setSelectedValueOptions] = useState<
    MultiValue<OptionType>
  >([])

  const handleChange = (selected: OptionType | null) => {
    setSelectedOption(selected)
  }

  const handleSearchChange = (selected: OptionType | null) => {
    setSelectedSearchOption(selected)
  }

  const handleMultiChange = (selected: MultiValue<OptionType>) => {
    setSelectedMultiOption(selected)
  }

  const handleMultiWithOutChange = (selected: MultiValue<OptionType>) => {
    setSelectedMultiWithOutOption(selected)
  }

  const handleDisableChange = (selected: MultiValue<OptionType>) => {
    setSelectedDisableOption(
      selected ? (selected[0] as OptionType | null) : null
    )
  }

  const isOptionDisabled = (option: OptionType) => {
    return disabledOptions.includes(option.value as number)
  }

  const handlegroupChange = (selected: MultiValue<OptionTypes>) => {
    setSelectedGroupOption(selected)
  }

  const isOptionSelected = (option: OptionType) => {
    return selectedOptionValue.includes(option.value as number)
  }

  const handlePresetChange = (selected: MultiValue<OptionType>) => {
    setSelectedPresetOption(selected)
  }

  const handleNativeChange = (selected: NativeOptionType | null) => {
    setSelectedNativeOption(selected)
  }

  const isOptionMultiSelected = (option: OptionType) => {
    return selectedOptionValue.includes(option.value as number)
  }

  const handlePresetMultiChange = (selected: MultiValue<OptionType>) => {
    setSelectedPresetMultiOption(selected)
  }

  const handleHideChange = (selected: OptionType | null) => {
    setSelectedHideOption(selected)
  }

  const handleWidthChange = (newValue: MultiValue<OptionType>) => {
    const selected = Array.isArray(newValue) ? newValue[0] || null : null
    setSelectedWidthOption(selected)
  }

  const customStyles: StylesConfig<OptionType, true> = {
    menu: (provided) => ({
      ...provided,
      width: '130px',
    }),
    control: (provided) => ({
      ...provided,
      width: 'auto',
    }),
  }

  const handlenewChange = (selected: OptionType | null) => {
    setSelectedNewOption(selected)
  }

  const handleCreate = (inputValue: string) => {
    const newOption: OptionType = { label: inputValue, value: inputValue }
    setOptions((prevOptions: OptionType[]) => [...prevOptions, newOption])
    setSelectedNewOption(newOption)
  }

  const handleMarkChange = (selected: OptionType | null) => {
    setSelectedmarkOption(selected)
  }

  const handleshowChange = (selected: MultiValue<OptionType>) => {
    setSelectedshowOption(selected)
  }

  const handleOptionsChange = (selected: MultiValue<OptionType>) => {
    if (selected.length > MAX_SELECTION) {
      alert(`You can select a maximum of ${MAX_SELECTION} options.`)
      return
    }
    setSelectedOptions(selected)
  }

  const handleDescriptiOnChange = (selected: OptionType | null) => {
    setSelecteddescriptionOption(selected)
  }

  const customFilterOption = (option: OptionType, searchInput: string) => {
    return searchInput.length > 0 || option.value === 0
  }

  const handleInputChange = (newValue: string) => {
    setMenuIsOpen(true)
    return newValue
  }

  const handleMenuOpen = () => {
    setMenuIsOpen(true)
  }

  const handleMenuClose = () => {
    setMenuIsOpen(false)
  }

  const formatOptionLabel = ({
    label,
    classNames,
  }: {
    label: string
    classNames?: string
  }) => (
    <div className="custom-option">
      {classNames && (
        <i className={`flag flag-${classNames} ltr:mr-2 rtl:ml-2`} />
      )}
      {label}
    </div>
  )

  const handleValueChange = (selected: MultiValue<OptionType>) => {
    setSelectedValueOptions(selected)
  }

  const customStylesValue: StylesConfig<OptionType, true> = {
    multiValue: (styles) => {
      return {
        ...styles,
        backgroundColor: 'none',
        border: '1px solid #ddd',
        borderRadius: '20px',
        padding: '1px 3px 1px 3px',
      }
    },
    multiValueRemove: (styles) => ({
      ...styles,
      color: '#9ca3af',
      backgroundColor: 'none',
      ':hover': {
        backgroundColor: 'none',
        color: '#9ca3af',
      },
    }),
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Select" subTitle="Forms" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Default Select</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={getOptions(3)}
              value={selectedOption}
              onChange={handleChange}
              placeholder="Select"
              id="sampleSelect"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">With search box</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={getOptions(3)}
              value={selectedSearchOption}
              onChange={handleSearchChange}
              isSearchable={true}
              placeholder="Select"
              id="searchBoxSelect"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Multiple Select</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={getOptions(3)}
              value={selectedMultiOption}
              onChange={handleMultiChange}
              isMulti={true}
              isSearchable={true}
              placeholder="Select"
              id="multipleSelect"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Multiple Select without Search</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={getOptions(8)}
              value={selectedMultiWithOutOption}
              onChange={handleMultiWithOutChange}
              isMulti={true}
              placeholder="Select"
              id="multipleWithoutSearchSelect"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Disabled options</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={getOptions(8)}
              value={selectedDisableOption}
              onChange={handleDisableChange}
              isMulti={true}
              isOptionDisabled={isOptionDisabled}
              placeholder="Select"
              id="disabledOptionSelect"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Option Group</h6>
          </div>
          <div className="card-body">
            <Select<OptionTypes, true, GroupedOptionType>
              options={groupedOptions}
              classNamePrefix="select"
              value={selectedGroupOption}
              onChange={handlegroupChange}
              placeholder="Select"
              id="optionGroupSelect"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Preselect value</h6>
          </div>
          <div className="card-body">
            <Select<OptionType, true>
              options={getOptions(8)}
              classNamePrefix="select"
              value={selectedPresetOption}
              onChange={handlePresetChange}
              isOptionSelected={isOptionSelected}
              placeholder="Select"
              id="preselectValue"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Preselect multiple values</h6>
          </div>
          <div className="card-body">
            <Select<OptionType, true>
              options={getOptions(8)}
              classNamePrefix="select"
              value={selectedPresetMultiOption}
              onChange={handlePresetMultiChange}
              isOptionSelected={isOptionMultiSelected}
              isMulti={true}
              placeholder="Select"
              id="preselectMultipleValue"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Hide Clear Button</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={getOptions(8)}
              value={selectedHideOption}
              onChange={handleHideChange}
              isClearable={false}
              placeholder="Select"
              id="hideClearButton"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Custom width for dropbox</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={getOptions(8)}
              value={selectedWidthOption}
              onChange={handleWidthChange}
              placeholder="Select"
              styles={customStyles}
              id="customWidthDropbox"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Allow to add new option</h6>
          </div>
          <div className="card-body">
            <CreatableSelect
              options={options}
              classNamePrefix="select"
              value={selectedNewOption}
              onChange={handlenewChange}
              onCreateOption={handleCreate}
              placeholder="Select or create new..."
              id="allowNewOption"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Mark matched term in label</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={getOptions(8)}
              value={selectedmarkOption}
              onChange={handleMarkChange}
              isSearchable={true}
              formatOptionLabel={(option: OptionType, { inputValue }) => {
                const highlightedLabel = highlightText(option.label, inputValue)
                return <div>{highlightedLabel}</div>
              }}
              placeholder="Select"
              id="markMatchedLabel"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Showing selected options first</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={sortOptions(
                getOptions(8),
                selectedshowOption ? [...selectedshowOption] : null
              )}
              value={selectedshowOption}
              onChange={handleshowChange}
              isMulti={true}
              placeholder="Select"
              id="showingSelectedOption"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Using alias for searching</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={aliasoptions}
              filterOption={customFilterOption}
              placeholder="Select an option"
              id="aliasForSearching"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Maximum Values</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={getOptions(8)}
              value={selectedOptions}
              onChange={handleOptionsChange}
              isMulti={true}
              placeholder="Select"
              id="maximumValues"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Label with description</h6>
          </div>
          <div className="card-body">
            <Select
              options={getOptions(3)}
              classNamePrefix="select"
              value={selecteddescriptionOption}
              onChange={handleDescriptiOnChange}
              placeholder="Select"
              id="labelDescription"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Show options only on search</h6>
          </div>
          <div className="card-body">
            <Select
              options={getOptions(8)}
              classNamePrefix="select"
              onInputChange={handleInputChange}
              filterOption={customFilterOption}
              menuIsOpen={menuIsOpen}
              onMenuOpen={handleMenuOpen}
              onMenuClose={handleMenuClose}
              placeholder="Select"
              id="showOptionOnlyOnSearch"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">
              Initialize from native select element (not recommended)
            </h6>
          </div>
          <div className="card-body">
            <Select<NativeOptionType>
              options={nativeOptions}
              value={selectedNativeOption}
              classNamePrefix="select"
              onChange={(e) => handleNativeChange(e)}
              isOptionDisabled={(option) => option?.isDisabled || false}
              placeholder="Select"
              id="nativeSelectReactSelect"
            />
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Image/Icon</h6>
          </div>
          <div className="card-body">
            <Select
              options={ImageOptions}
              classNamePrefix="select"
              formatOptionLabel={formatOptionLabel}
              placeholder="Select"
              id="sample-image"
            />
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Show values as tags</h6>
          </div>
          <div className="card-body">
            <Select
              options={getOptions(5)}
              classNamePrefix="select"
              value={selectedValueOptions}
              onChange={handleValueChange}
              placeholder="Select"
              id="value-tag"
              isMulti={true}
              styles={customStylesValue}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default SelectPage
