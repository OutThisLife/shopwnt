/* eslint-disable camelcase */

export interface Variant {
  available: boolean
  barcode?: any
  compare_at_price: string
  created_at: Date
  featured_image?: any
  grams: number
  id: string
  image_id?: any
  inventory_management: string
  inventory_quantity: number
  old_inventory_quantity: number
  option1: string
  option2?: any
  option3?: any
  position: number
  price: string
  product_id: any
  requires_shipping: boolean
  sku: string
  taxable: boolean
  title: string
  updated_at: Date
  weight_unit: string
  weight: number
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

export interface Brand {
  slug: string
  test?: RegExp
}
