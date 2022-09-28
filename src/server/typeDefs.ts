import { gql } from 'apollo-server-micro'

export default gql`
  type Query {
    getProducts(slugs: [ID!]!): [Product]
    getProduct(slug: ID!, handle: ID!): Product
  }

  type Product @exclude(operations: [CREATE, UPDATE, DELETE]) {
    id: ID!
    availability: Variant
    body_html: String
    created_at: Date
    handle: String
    url: String
    images: [Image]
    options: [Option]
    price: String
    product_type: String
    published_at: Date
    tags: [String]
    title: String
    updated_at: Date
    variants: [Variant]
    originalVariants: [Variant]
    vendor: String
  }

  type Variant @exclude(operations: [CREATE, UPDATE, DELETE]) {
    id: ID!
    available: Boolean
    barcode: String
    compare_at_price: String
    created_at: Date
    featured_image: String
    grams: Int
    image_id: String
    inventory_management: String
    inventory_quantity: Int
    old_inventory_quantity: Int
    option1: String
    option2: String
    option3: String
    position: Int
    price: String
    product_id: String
    requires_shipping: Boolean
    sku: String
    taxable: Boolean
    title: String
    updated_at: Date
    weight_unit: String
    weight: Int
  }

  type Image @exclude(operations: [CREATE, UPDATE, DELETE]) {
    id: ID!
    created_at: Date
    position: Int
    updated_at: Date
    product_id: ID
    variant_ids: [ID]
    src: String
    width: Int
    height: Int
  }

  type Option @exclude(operations: [CREATE, UPDATE, DELETE]) {
    name: String
    position: Int
    values: [String]
  }
`
