'use client'

import React, { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import shoppingCart from '@assets/images/others/shopping-cart.png'
import BreadCrumb from '@src/components/common/BreadCrumb'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import { NextPageWithLayout, WishListProduct } from '@src/dtos'
import {
  deleteWishListProduct,
  getWishList,
  updateWishListProductQuantity,
} from '@src/slices/ecommerce/wishlist/thunk'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { addNewShopProduct } from '@src/slices/thunk'
import { MoveLeft, MoveRight } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

const WishList: NextPageWithLayout = () => {
  const dispatch = useDispatch<AppDispatch>()

  const { wishListData } = useSelector((state: RootState) => state.WishList)
  const { shopCartList } = useSelector((state: RootState) => state.ShopCarts)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )

  const [allWishListData, setAllWishListData] = useState<WishListProduct[]>([])

  useEffect(() => {
    if (!wishListData) {
      dispatch(getWishList())
    } else {
      setAllWishListData(wishListData)
    }
  }, [wishListData, dispatch])

  // Update product quantity
  const handleQuantityChange = (product: WishListProduct, count: number) => {
    const newProduct = { ...product, count: count }
    dispatch(updateWishListProductQuantity(newProduct))
  }

  // Add product to cart
  const handleAddToCartProduct = (product: WishListProduct) => {
    const newProduct = {
      ...product,
      id: shopCartList ? shopCartList.length + 1 : 1,
    }
    dispatch(addNewShopProduct(newProduct))
    // dispatch(deleteWishListProduct([product.id]));
  }

  // Delete product from wishlist
  const handleDeleteProduct = (id: number) => {
    dispatch(deleteWishListProduct([id]))
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Wishlist" subTitle="Ecommerce" />
      <div className="card">
        <div className="card-header">
          <h6 className="card-title">💖 Wishlist</h6>
        </div>
        <div className="pt-0 card-body">
          <div>
            <div className="overflow-x-auto table-box">
              <table className="table flush">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allWishListData && allWishListData.length < 1 && (
                    <tr>
                      <td colSpan={5} className="whitespace-nowrap">
                        <div className="p-4 text-center">
                          <Image
                            src={shoppingCart}
                            alt="shoppingCart"
                            className="block mx-auto size-16"
                          />
                          <h6 className="mt-4 mb-1">
                            Your wishlist is waiting for you.
                          </h6>
                          <p className="mb-3 text-gray-500 dark:text-dark-500">
                            Add items to your wishlist as you browse, and they
                            will magically appear here.
                          </p>

                          <div className="flex items-center justify-center gap-2">
                            <button className="btn btn-primary">
                              Browse our catalog
                            </button>
                            <button className="btn btn-outline-purple">
                              Go to your cart
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {allWishListData &&
                    allWishListData.length > 0 &&
                    allWishListData.map(
                      (item: WishListProduct, index: number) => (
                        <tr className="*:px-3 *:py-2.5" key={index}>
                          <td className="whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              <div className="relative flex items-center justify-center p-2 bg-gray-100 dark:bg-dark-850 size-16">
                                <button
                                  className="absolute flex items-center justify-center bg-white dark:bg-dark-900 rounded-full shadow-lg shadow-gray-200 dark:shadow-dark-800 hover:text-red-500 transition duration-300 ease-linear -top-1.5 ltr:-right-1.5 rtl:-left-1.5 size-4"
                                  onClick={() => handleDeleteProduct(item.id)}>
                                  <i className="ri-close-line"></i>
                                </button>
                                <Image
                                  src={item.image1}
                                  alt="productImg"
                                  width={48}
                                  height={48}
                                />
                              </div>
                              <div className="grow">
                                <h6 className="mb-1">{item.productName}</h6>
                                <p className="text-gray-500 dark:text-dark-500 divide-x divide-gray-200 dark:divide-dark-800 flex gap-2 items-center mb-2">
                                  <span className="px-2 ltr:first:!pl-0 rtl:first:!pr-0">
                                    {item.activeColor}
                                  </span>

                                  <span>{item.activeSize}</span>
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>{item.price}</td>
                          <td>
                            <div className="input-spin-group input-spin-primary">
                              <button
                                className="text-lg input-spin-minus"
                                onClick={() =>
                                  handleQuantityChange(
                                    item,
                                    item.count > 1 ? item.count - 1 : 1
                                  )
                                }>
                                <i className="ri-subtract-line"></i>
                              </button>
                              <input
                                type="text"
                                className="text-center input-spin form-input"
                                readOnly
                                value={item.count}
                              />
                              <button
                                className="text-lg input-spin-plus"
                                onClick={() =>
                                  handleQuantityChange(
                                    item,
                                    item.count < item.stock
                                      ? item.count + 1
                                      : item.stock
                                  )
                                }>
                                <i className="ri-add-line"></i>
                              </button>
                            </div>
                          </td>
                          <td>{(item.price * item.count).toFixed(2)}</td>
                          <td>
                            <Link
                              href="/apps/ecommerce/shop-cart"
                              type="btn btn-sub-gray whitespace-nowrap"
                              onClick={() => {
                                handleAddToCartProduct(item)
                              }}
                              className="btn btn-sub-gray whitespace-nowrap">
                              <i className='class="align-bottom ri-shopping-cart-line me-2'></i>
                              Add to Cart
                            </Link>
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
              <Link
                href="/apps/ecommerce/products/grid"
                className="btn btn-sub-purple">
                <MoveLeft className="inline-block ltr:mr-1 rtl:ml-1 size-5" />{' '}
                Continue Shopping
              </Link>
              <Link
                href="/apps/ecommerce/shop-cart"
                className="btn btn-sub-green">
                Update to Cart{' '}
                <MoveRight className="inline-block ltr:ml-1 rtl:mr-1 size-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />
    </React.Fragment>
  )
}

export default WishList
