'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { SellingProduct } from '@src/data'
import { NextPageWithLayout } from '@src/dtos'
import SimpleBar from 'simplebar-react'

const TopSellingProducts: NextPageWithLayout = () => {
  return (
    <React.Fragment>
      <div className="order-10 col-span-12 xl:col-span-6 2xl:col-span-4 card">
        <div className="flex items-center gap-5 card-header">
          <h6 className="card-title grow">Top selling Products</h6>
          <Link href="#!" className="underline link link-primary">
            View All <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
        <div className="card-body">
          <SimpleBar className="h-[180px] -mx-space px-space">
            <div className="flex flex-col gap-4">
              {SellingProduct.map((product, index) => {
                return (
                  <div
                    key={index}
                    className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="bg-gray-100 rounded-md size-16 dark:bg-dark-850 shrink-0">
                      <Image src={product.image} alt="productImg" />
                    </div>
                    <div className="grow">
                      <h6>
                        <Link href="/apps-ecommerce-product-overview">
                          {product.name}
                        </Link>
                      </h6>
                      <div className="text-orange-400">
                        <i className={product.rank.star1}></i>
                        <i className={product.rank.star2}></i>
                        <i className={product.rank.star3}></i>
                        <i className={product.rank.star4}></i>
                        <i className={product.rank.star5}></i>
                      </div>
                      <h6>{product.price}</h6>
                    </div>
                    <div className="flex gap-1 md:flex-col md:items-end shrink-0">
                      <button
                        type="button"
                        className="btn btn-sm btn-sub-green">
                        <i className="ri-pencil-line"></i> Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-sub-red">
                        <i className="ri-close-line"></i> Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </SimpleBar>
        </div>
      </div>
    </React.Fragment>
  )
}
export default TopSellingProducts
