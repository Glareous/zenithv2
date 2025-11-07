'use client'

import React, { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import { ProductListItem } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { addNewShopProduct, deleteWishListProduct } from '@src/slices/thunk'
import { api } from '@src/trpc/react'
import { Check, Edit2, Heart, Minus, Plus, Trash2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import SwiperSection from './SwiperSection'

const Wishlist = () => {
  const dispatch: AppDispatch = useDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('id')

  const currentProduct = useSelector(
    (state: RootState) => state.ProductList.currentProduct
  )
  const { shopCartList } = useSelector((state: RootState) => state.ShopCarts)
  const [activeLink, setActiveLink] = useState('gray')
  const [activeSize, setActiveSize] = useState('m')
  const [count, setCount] = useState(1)
  const [showMore, setShowMore] = useState(false)
  const [showMore1, setShowMore1] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: product, isLoading } = api.projectProduct.getById.useQuery(
    { id: productId! },
    { enabled: !!productId }
  )

  const deleteProduct = api.projectProduct.delete.useMutation({
    onSuccess: () => {
      toast.success('Product successfully removed')
      router.push('/apps/ecommerce/products/grid')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const getCategoriesDisplay = (categories: any[]) =>
    categories && categories.length > 0
      ? categories.map((c) => c.category.name).join(', ')
      : 'No category'

  const getTotalStock = (warehouses: any[]) =>
    warehouses && warehouses.length > 0
      ? warehouses.reduce((sum, w) => sum + w.stock, 0)
      : 0

  const handleDecrement = () => {
    if (count > 1) {
      setCount((prevCount) => prevCount - 1)
    }
  }

  const handleIncrement = () => {
    const totalStock = getTotalStock(product?.warehouses || [])
    if (count < totalStock) {
      setCount((prevCount) => prevCount + 1)
    }
  }

  const handleDeleteClick = () => {
    setIsModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (productId) {
      deleteProduct.mutate({ id: productId })
    }
    setIsModalOpen(false)
  }

  const handleAddToCartProduct = (product: ProductListItem) => {
    const isCart = shopCartList.some(
      (item: ProductListItem) => item.productId === product.productId
    )

    if (isCart) {
      dispatch(deleteWishListProduct([product.id]))
    } else {
      const newProduct = { ...product }
      dispatch(addNewShopProduct(newProduct))
    }
  }

  useEffect(() => {
    if (!currentProduct) {
      setActiveLink('Gray')
      setActiveSize('M')
      setCount(1)
    } else {
      setActiveLink(currentProduct.activeColor)
      setActiveSize(currentProduct.activeSize)
      setCount(currentProduct.count)
    }
  }, [currentProduct])

  if (isLoading || !product) {
    return (
      <div className="card">
        <div className="card-body">Loading...</div>
      </div>
    )
  }

  const totalPrice = (product?.price || 0) * count
  const totalStock = getTotalStock(product?.warehouses || [])

  return (
    <React.Fragment>
      <div className="card">
        <div className="card-body">
          <div className="flex  gap-5">
            <div className="w-1/2">
              <SwiperSection />
            </div>
            <div className="w-1/2">
              <div className="flex items-center justify-end mb-5">
                <div className="divide-x divide-gray-200 rtl:divide-x-reverse dark:divide-dark-800 shrink-0">
                  <Link
                    href={`/apps/ecommerce/products/create-products?id=${product.id}`}
                    className="ltr:pr-1 rtl:pl-1 link link-primary">
                    <Edit2 className="size-4 mr-1 inline-block"></Edit2>
                    <span className="align-middle">Edit</span>
                  </Link>
                  <button
                    onClick={handleDeleteClick}
                    className="ltr:pl-2 rtl:pr-2 link link-red">
                    <Trash2 className="size-4 mr-1 inline-block"></Trash2>
                    <span className="align-middle">Delete</span>
                  </button>
                </div>
              </div>
              <h5 className="mb-3">{product.name}</h5>
              <div className="flex items-center divide-x divide-gray-200 dark:divide-dark-800 rtl:divide-x-reverse *:px-3 mb-5">
                <p className="ltr:first:pl-0 rtl:first:pr-0">
                  <i className="text-yellow-500 align-bottom ri-star-half-line"></i>{' '}
                  4.8
                </p>
                <p className="ltr:first:pl-0 rtl:first:pr-0">149 Reviews</p>
                <p className="ltr:first:pl-0 rtl:first:pr-0">4789 Sales</p>
              </div>

              <h4 className="flex items-center gap-2 mt-3">
                <span>${(product.price || 0).toFixed(2)}</span>
                <small className="font-normal text-gray-500 line-through dark:text-dark-500">
                  $<span>{(product.price || 0) * 2}</span>
                </small>
                <span className="text-xs badge badge-red shrink-0">50%</span>
              </h4>

              <div className="mt-2 text-lg font-semibold text-primary-600">
                Total: ${totalPrice.toFixed(2)} ({count} items)
              </div>

              <div className="mb-2 text-sm text-gray-500 mt-3">
                <b>Categories:</b> {getCategoriesDisplay(product.categories)}
              </div>

              <div className="mb-2 text-sm text-gray-500">
                <b>Stock:</b> {totalStock} units
              </div>

              <div className="my-5">
                <div className="flex items-center w-32 p-1 text-center border border-gray-200 rounded-md dark:border-dark-800">
                  <button
                    onClick={handleDecrement}
                    disabled={count <= 1}
                    className={`flex items-center justify-center transition duration-200 ease-linear rounded-md size-8 shrink-0 ${
                      count <= 1
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-primary-500 bg-primary-500/20 hover:text-primary-700'
                    }`}>
                    <Minus className="size-4"></Minus>
                  </button>
                  <input
                    type="text"
                    value={count || 1}
                    className="h-8 p-0 text-center border-0 rounded-none form-input"
                    readOnly
                  />
                  <button
                    onClick={handleIncrement}
                    disabled={count >= totalStock}
                    className={`flex items-center justify-center transition duration-200 ease-linear rounded-md size-8 shrink-0 ${
                      count >= totalStock
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-primary-500 bg-primary-500/20 hover:text-primary-700'
                    }`}>
                    <Plus className="size-4"></Plus>
                  </button>
                </div>
                {count >= totalStock && totalStock > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Máximo stock disponible: {totalStock}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-5">
                <button type="button" className="btn btn-red w-36">
                  Buy Now
                </button>
                {shopCartList?.some(
                  (wishItem: ProductListItem) =>
                    wishItem.productId === currentProduct?.productId
                ) ? (
                  <button
                    type="button"
                    className={'w-36 btn btn-sub-primary'}
                    onClick={() => {
                      router.push('/apps/ecommerce/shop-cart')
                    }}>
                    Go to Cart
                  </button>
                ) : currentProduct ? (
                  <button
                    type="button"
                    className={'btn btn-primary w-36'}
                    onClick={(e) => {
                      e.preventDefault()
                      handleAddToCartProduct(currentProduct)
                    }}>
                    Add to Cart
                  </button>
                ) : (
                  <button type="button" className={'btn btn-primary w-36'}>
                    Add to Cart
                  </button>
                )}
              </div>

              <h6 className="mb-1">Product Overview</h6>
              <p className="mb-4 text-gray-500 dark:text-dark-500">
                {product.description || 'No description available'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <DeleteModal
          show={isModalOpen}
          title="Are you sure you want to delete this Product?"
          message={`This will permanently delete "${product.name}" and all its associated data.`}
          handleHide={() => setIsModalOpen(false)}
          deleteModalFunction={handleConfirmDelete}
        />
      )}
    </React.Fragment>
  )
}

export default Wishlist
