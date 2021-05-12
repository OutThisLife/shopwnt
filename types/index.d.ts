export interface Variant {
  id: string
  title: string
  option1: string
  option2?: any
  option3?: any
  sku: string
  requires_shipping: boolean
  taxable: boolean
  featured_image?: any
  available: boolean
  price: string
  grams: number
  compare_at_price: string
  position: number
  product_id: any
  created_at: Date
  updated_at: Date
  barcode?: any
  image_id?: any
  weight: number
  weight_unit: string
  inventory_quantity: number
  old_inventory_quantity: number
}

export interface Image {
  id: string
  created_at: Date
  position: number
  updated_at: Date
  product_id: any
  variant_ids: any[]
  src: string
  width: number
  height: number
}

export interface Option {
  name: string
  position: number
  values: string[]
}

export interface Product {
  availability?: Variant
  body_html: string
  created_at: Date
  handle: string
  id: string
  images: Image[]
  options: Option[]
  product_type: string
  published_at: Date
  tags: string[]
  title: string
  updated_at: Date
  variants: Variant[]
  vendor: string
}
