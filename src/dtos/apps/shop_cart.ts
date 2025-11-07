import { StaticImageData } from 'next/image'

export interface ShopCartProduct {
  id: number
  productId: string
  productName: string
  description: string
  category: string
  count: number
  price: number
  discount: number
  selling_price: number
  revenue: number
  color: string
  size: string[]
  colors: string[]
  gender: string
  stock: number
  qty: number
  image1: string
  image2: string | StaticImageData
  image3: string | StaticImageData
  status: string
  payment_method: string
  brand: string
  activeColor: string
  activeSize: string
}
