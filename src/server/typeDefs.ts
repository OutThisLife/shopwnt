const typeDefs = /* GraphQL */ `
  type Query {
    products(where: ProductWhere, options: Options): [Product!]!
    facets(where: ProductWhere): [Facet!]!
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
    q: String
    facets: [FacetSelection!]
  }

  "One facet group's selected values. Empty values leave the group unfiltered."
  input FacetSelection {
    key: String!
    values: [String!]!
  }

  """
  A filter group derived from whatever the selected brands actually carry —
  product type, plus every option name they use (Size, Color, Fit, …) and
  stock status. Nothing here is hardcoded, so the menu changes with the brands.
  """
  type Facet {
    key: String!
    label: String!
    values: [FacetValue!]!
  }

  type FacetValue {
    value: String!
    "Matches remaining once every *other* group's selection is applied."
    count: Int!
  }

  input Options {
    sort: [ProductSort!]
    limit: Int
    offset: Int
  }

  """
  Sorting runs on resolved moments rather than raw Shopify stamps: 'arrived' is
  when a product reached the storefront, 'revised' is when it last genuinely
  changed. See arrivedAt / revisedAt in lib/util.
  """
  input ProductSort {
    price: SortDirection
    arrived: SortDirection
    revised: SortDirection
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

export default typeDefs
