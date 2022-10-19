import { gql } from 'apollo-server-micro'

export default gql`
  type Query {
    products(where: ProductWhere, options: Options): [Product!]!
  }

  scalar Date

  enum SortDirection {
    ASC
    DESC
  }

  input ProductWhere {
    OR: [ProductWhere!]
    AND: [ProductWhere!]
    handle_IN: [ID!]!
    id_IN: [ID!]
  }

  input Options {
    sort: [ProductSort!]
    limit: Int
    offset: Int
  }

  input ProductSort {
    id: SortDirection
    price: SortDirection
    created_at: SortDirection
    published_at: SortDirection
    updated_at: SortDirection
  }

  type Product {
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
    vendor: String!
  }

  type Variant {
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

  type Image {
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

  type Option {
    name: String
    position: Int
    values: [String]
  }
`
