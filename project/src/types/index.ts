export type UserRole = 'user' | 'seller' | 'admin'

export type ProductStatus = 'pending' | 'approved' | 'rejected'

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface SellerApplication {
  id: string
  user_id: string
  shop_name: string
  shop_description?: string
  phone: string
  tax_id?: string
  address?: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
  user?: Pick<User, 'full_name' | 'email' | 'username'>
}

export interface User {
  id: string
  email: string
  full_name: string
  username: string
  phone?: string
  avatar_url?: string
  role: UserRole
  is_seller: boolean
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string
  order: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  discount_price?: number
  stock: number
  sku: string
  brand: string
  category_id: string
  seller_id: string
  images: string[]
  specifications: Record<string, string>
  status: ProductStatus
  rejection_reason?: string
  rating: number
  review_count: number
  is_featured: boolean
  is_new: boolean
  is_bestseller: boolean
  created_at: string
  updated_at: string
}

export interface ProductReview {
  id: string
  product_id: string
  user_id: string
  rating: number
  title: string
  comment: string
  images?: string[]
  is_verified_purchase: boolean
  helpful_count: number
  created_at: string
  user?: {
    full_name: string
    avatar_url?: string
  }
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  product?: Product
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  product_id: string
  product?: Product
  created_at: string
}

export interface Address {
  id: string
  user_id: string
  title: string
  full_name: string
  phone: string
  city: string
  district: string
  neighborhood: string
  address: string
  postal_code?: string
  is_default: boolean
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  status: OrderStatus
  items: OrderItem[]
  shipping_address: Address
  billing_address: Address
  subtotal: number
  discount: number
  shipping_cost: number
  tax: number
  total: number
  coupon_code?: string
  payment_method: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  notes?: string
  created_at: string
  updated_at: string
  user?: Pick<User, 'full_name' | 'email'>
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_image: string
  quantity: number
  unit_price: number
  total: number
  seller_id: string
}

export interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order_amount?: number
  max_discount?: number
  usage_limit?: number
  used_count: number
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  image_url: string
  link_url?: string
  button_text?: string
  order: number
  is_active: boolean
  start_date?: string
  end_date?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  link?: string
  is_read: boolean
  created_at: string
}
