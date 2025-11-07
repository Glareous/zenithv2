export interface OptionType {
  label: string
  value: string
}

const categoryItems: OptionType[] = [
  { label: 'Fashion', value: 'Fashion' },
  { label: 'Fruits', value: 'fruits' },
  { label: 'Footwear', value: 'Footwear' },
  { label: 'Bags', value: 'Bags' },
  { label: 'Watch', value: 'Watch' },
]

const brandItems = [
  { label: 'Gucci', value: 'Gucci' },
  { label: 'Rolex', value: 'Rolex' },
  { label: 'Calvin Klein', value: 'Calvin Klein' },
  { label: 'Zara', value: 'Zara' },
  { label: 'Nike', value: 'Nike' },
  { label: 'Adidas', value: 'Adidas' },
]

const SizeItems = [
  { label: 'XS', value: 'XS' },
  { label: 'S', value: 'S' },
  { label: 'M', value: 'M' },
  { label: 'L', value: 'L' },
  { label: 'XL', value: 'XL' },
  { label: '2XL', value: '2XL' },
]

const ColorItems = [
  { label: 'Blue', value: 'Blue' },
  { label: 'Green', value: 'Green' },
  { label: 'Yellow', value: 'Yellow' },
  { label: 'Sky', value: 'Sky' },
  { label: 'Red', value: 'Red' },
  { label: 'Pink', value: 'Pink' },
  { label: 'Gray', value: 'Gray' },
  { label: 'Purple', value: 'Purple' },
]

const statusItems: OptionType[] = [
  { label: 'Published', value: 'Published' },
  { label: 'Inactive', value: 'Inactive' },
]
export { categoryItems, brandItems, ColorItems, statusItems, SizeItems }
