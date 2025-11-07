export interface OptionType {
  label: string
  value: string
}

const paymentOptions: OptionType[] = [
  { label: 'Paid', value: 'PAID' },
  { label: 'Unpaid', value: 'UNPAID' },
  { label: 'COD', value: 'COD' },
]

const statusOptions: OptionType[] = [
  { label: 'New', value: 'NEW' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Shipping', value: 'SHIPPING' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

const paymentNameOptions: OptionType[] = [
  { label: 'Denim Jacket', value: 'Denim Jacket' },
  { label: 'Leather Wallet', value: 'Leather Wallet' },
  { label: 'Wireless Headphones', value: 'Wireless Headphones' },
  { label: 'Sunglasses', value: 'Sunglasses' },
  { label: 'Backpack', value: 'Backpack' },
  { label: 'Winter Coat', value: 'Winter Coat' },
  { label: 'Handbag', value: 'Handbag' },
  { label: 'Sweater', value: 'Sweater' },
  { label: 'Sports Watch', value: 'Sports Watch' },
]
export { paymentOptions, statusOptions, paymentNameOptions }
