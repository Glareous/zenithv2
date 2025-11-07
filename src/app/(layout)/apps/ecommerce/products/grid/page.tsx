'use client'

import React, { useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import Pagination from '@src/components/common/Pagination'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import { Drawer } from '@src/components/custom/drawer/drawer'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { NextPageWithLayout } from '@src/dtos'
import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import {
  Heart,
  List,
  Plus,
  ShoppingCart,
  SlidersHorizontal,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { ToastContainer } from 'react-toastify'

import Filter from '../../../../../../components/molecules/Filter'

type ProductData = {
  id: string
  name: string
  description: string | null
  price: number | null
  isActive: boolean
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
  categories: Array<{
    category: {
      id: string
      name: string
    }
  }>
  warehouses: Array<{
    warehouse: {
      id: string
      name: string
      warehouseId: string
      isDefault: boolean
      description: string | null
      createdAt: Date
      updatedAt: Date
      createdById: string
      projectId: string
      isActive: boolean
    }
    stock: number
  }>
  files: Array<{
    id: string
    s3Url: string
    name: string
  }>
}

type PaginatedResponse = {
  products: ProductData[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

const ProductGrid: NextPageWithLayout = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletedRecord, setDeletedRecord] = useState<string[] | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8)
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [categoryCount, setCategoryCount] = useState(0)
  const [colorCount, setColorCount] = useState(0)

  const currentProject = useSelector(
    (state: RootState) => state.Project.currentProject
  )
  const projectId = currentProject?.id || ''

  const { data: productsData, isLoading: loadingProducts } =
    api.projectProduct.getAll.useQuery(
      {
        projectId,
        page: currentPage,
        limit: itemsPerPage,
        search: search || undefined,
        categories:
          selectedCategories.length > 0 ? selectedCategories : undefined,
      },
      { enabled: !!projectId }
    )

  const deleteProduct = api.projectProduct.delete.useMutation({
    onSuccess: () => {
      toast.success('Product successfully removed')
      window.location.reload()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const handleEditProduct = (product: ProductData) => {
    router.push(`/apps/ecommerce/products/create-products?id=${product.id}`)
  }

  const handleAddProduct = () => {
    localStorage.setItem('previousPage', '/apps/ecommerce/products/grid')
    router.push('/apps/ecommerce/products/create-products')
  }

  const handleDeleteRecord = (id: string) => {
    setIsModalOpen(true)
    setDeletedRecord([id])
  }

  const setDeleteRecord = () => {
    if (deletedRecord && isModalOpen) {
      deletedRecord.forEach((id) => {
        deleteProduct.mutate({ id })
      })
      setIsModalOpen(false)
      setDeletedRecord(null)
    }
  }

  const openDrawer = () => setDrawerOpen(true)
  const closeDrawer = () => setDrawerOpen(false)

  const handleProductClick = (product: ProductData) => {
    router.push(`/apps/ecommerce/products/overview?id=${product.id}`)
  }

  const handleFilterChange = (data: {
    categories: string[]
    colors: string[]
  }) => {
    console.log('Filter changed:', data)
    setSelectedCategories(data.categories)
    setCurrentPage(1)
  }

  const updateCountCategory = (count: number) => {
    setCategoryCount(count)
  }

  const updateCountColor = (count: number) => {
    setColorCount(count)
  }

  const getCategoriesDisplay = (categories: ProductData['categories']) => {
    if (!categories || categories.length === 0) return 'No category'
    return categories.map((c) => c.category.name).join(', ')
  }

  const getFirstImage = (product: ProductData) => {
    return product.files?.[0]?.s3Url || product.imageUrl
  }

  const getTotalStock = (warehouses: ProductData['warehouses']) => {
    if (!warehouses || warehouses.length === 0) return 0
    return warehouses.reduce((sum, w) => sum + w.stock, 0)
  }

  const products = productsData?.products || []
  const pagination = productsData?.pagination

  if (loadingProducts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Products Grid" subTitle="Ecommerce" />
      <div className="card">
        <div className="flex flex-wrap items-center gap-5 card-header">
          <div className="grow">
            <h6 className="mb-1 card-title">Popular Products</h6>
            <p className="text-gray-500 dark:text-dark-500">
              Track your store&apos;s progress to boost your sales.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="hidden">
              <Link
                href="/apps/ecommerce/wishlist"
                className="relative inline-block">
                <Heart className="inline-block text-red-500 size-6 fill-red-500 mt-2 mr-2" />
                <span className="absolute -top-0 -right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-500 bg-red-100 rounded-full">
                  0
                </span>
              </Link>
              <Link
                href="/apps/ecommerce/shop-cart"
                className="relative inline-block">
                <ShoppingCart className="inline-block text-blue-500 size-6 fill-blue-500 mt-2 mr-2" />
                <span className="absolute -top-0 -right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-blue-500 bg-blue-100 rounded-full">
                  0
                </span>
              </Link>
            </div>
            <button className="btn btn-sub-gray" onClick={openDrawer}>
              <SlidersHorizontal className="inline-block ltr:mr-1 rt:ml-1 align-center size-4" />
              Filters
            </button>
            <Link
              href="#!"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault()
                handleAddProduct()
              }}>
              <Plus className="inline-block ltr:mr-1 rt:ml-1 align-center size-4" />{' '}
              Add Product
            </Link>
            <Link
              href="/apps/ecommerce/products/list"
              className="btn btn-purple btn-icon">
              <List className="size-5" />
            </Link>
          </div>
        </div>

        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
                className="form-select form-select-sm w-20">
                <option value={8}>8</option>
                <option value={16}>16</option>
                <option value={24}>24</option>
                <option value={32}>32</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
            {pagination && (
              <div className="text-sm text-gray-600">
                Showing{' '}
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{' '}
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}{' '}
                of {pagination.totalItems} products
              </div>
            )}
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5">
              {products.map((item: ProductData) => (
                <div className="card" key={item.id}>
                  <div className="p-2 card-body">
                    <div className="relative card-body">
                      <Dropdown
                        position="right"
                        trigger="click"
                        dropdownClassName="dropdown absolute right-2 top-2 ">
                        <DropdownButton colorClass="flex items-center justify-center bg-zinc-200 rounded-full size-10 link link-primary ">
                          <i className="ri-more-2-fill"></i>
                        </DropdownButton>
                        <DropdownMenu menuClass="p-2">
                          <Link
                            href="#!"
                            className="dropdown-item "
                            onClick={(e) => {
                              e.preventDefault()
                              handleEditProduct(item)
                            }}>
                            <i className="align-middle ltr:mr-2 rtl:ml-2 ri-pencil-line"></i>
                            <span>Edit</span>
                          </Link>
                          <Link
                            href="#!"
                            className="dropdown-item dropdown-red"
                            onClick={(e) => {
                              e.preventDefault()
                              handleDeleteRecord(item.id)
                            }}>
                            <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>
                            <span>Delete</span>
                          </Link>
                        </DropdownMenu>
                      </Dropdown>

                      <div className="flex items-center justify-center h-32">
                        {getFirstImage(item) ? (
                          <Image
                            src={getFirstImage(item)!}
                            className="w-full h-full object-contain"
                            alt="itemImg"
                            height={100}
                            width={100}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src =
                                '/assets/images/products/product-placeholder.png'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-4xl font-medium text-gray-600">
                              {item.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-1 mt-2">
                      <h5 className="mb-2">${(item.price || 0).toFixed(2)}</h5>
                      <h6 className="mb-1">
                        <Link
                          href={`/apps/ecommerce/products/overview?id=${item.id}`}
                          className="hover:text-primary-500 transition-colors">
                          {item.name}
                        </Link>
                      </h6>
                      <p className="text-gray-400 text-sm mb-2">
                        Stock: {getTotalStock(item.warehouses)} units
                      </p>
                      <p className="text-gray-500 text-xs">
                        {getCategoriesDisplay(item.categories)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="!p-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                className="mx-auto size-12"
                viewBox="0 0 48 48">
                <linearGradient
                  id="SVGID_1__h35ynqzIJzH4_gr1"
                  x1="34.598"
                  x2="15.982"
                  y1="15.982"
                  y2="34.598"
                  gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#60e8fe"></stop>
                  <stop offset=".033" stopColor="#6ae9fe"></stop>
                  <stop offset=".197" stopColor="#97f0fe"></stop>
                  <stop offset=".362" stopColor="#bdf5ff"></stop>
                  <stop offset=".525" stopColor="#dafaff"></stop>
                  <stop offset=".687" stopColor="#eefdff"></stop>
                  <stop offset=".846" stopColor="#fbfeff"></stop>
                  <stop offset="1" stopColor="#fff"></stop>
                </linearGradient>
                <path
                  fill="url(#SVGID_1__h35ynqzIJzH4_gr1)"
                  d="M40.036,33.826L31.68,25.6c0.847-1.739,1.335-3.684,1.335-5.748c0-7.27-5.894-13.164-13.164-13.164	S6.688,12.582,6.688,19.852c0,7.27,5.894,13.164,13.164,13.164c2.056,0,3.995-0.485,5.728-1.326l3.914,4.015l4.331,4.331	c1.715,1.715,4.496,1.715,6.211,0C41.751,38.321,41.751,35.541,40.036,33.826z"></path>
                <path
                  fill="none"
                  stroke="#10cfe3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeMiterlimit="10"
                  strokeWidth="3"
                  d="M31.95,25.739l8.086,8.086c1.715,1.715,1.715,4.496,0,6.211l0,0c-1.715,1.715-4.496,1.715-6.211,0	l-4.331-4.331"></path>
                <path
                  fill="none"
                  stroke="#10cfe3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeMiterlimit="10"
                  strokeWidth="3"
                  d="M7.525,24.511c-1.771-4.694-0.767-10.196,3.011-13.975c3.847-3.847,9.48-4.817,14.228-2.912"></path>
                <path
                  fill="none"
                  stroke="#10cfe3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeMiterlimit="10"
                  strokeWidth="3"
                  d="M30.856,12.603c3.376,5.114,2.814,12.063-1.688,16.565c-4.858,4.858-12.565,5.129-17.741,0.814"></path>
              </svg>
              <p className="mt-2 text-center text-gray-500 dark:text-dark-500">
                No matching records found
              </p>
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                currentPage={pagination.currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <DeleteModal
          show={isModalOpen}
          handleHide={() => setIsModalOpen(false)}
          deleteModalFunction={setDeleteRecord}
        />
      )}

      <Filter
        isDrawerOpen={isDrawerOpen}
        closeDrawer={closeDrawer}
        onFilterChange={handleFilterChange}
        updateCountCategory={updateCountCategory}
        updateCountColor={updateCountColor}
        selectedCategories={selectedCategories}
        selectedColors={selectedColors}
        setSelectedCategories={setSelectedCategories}
        setSelectedColors={setSelectedColors}
        search={search}
        setSearch={setSearch}
      />

      <ToastContainer theme="light" rtl={false} position="top-right" />
    </React.Fragment>
  )
}

export default ProductGrid
