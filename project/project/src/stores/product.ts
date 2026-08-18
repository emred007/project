import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { Product, Category, ProductReview } from '@/types'
import {
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  getDemoFeatured,
  getDemoBestsellers,
  getDemoNewArrivals,
  getDemoProductById,
  getDemoProductsByCategorySlug,
  enrichProductImages,
} from '@/data/demoProducts'
import {
  addLocalPendingProduct,
  getLocalApprovedProducts,
  mergeApprovedProducts,
} from '@/data/localProducts'

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: row.description as string | undefined,
    image_url: row.image_url as string | undefined,
    parent_id: row.parent_id as string | undefined,
    order: (row.sort_order as number) ?? (row.order as number) ?? 0,
    is_active: row.is_active as boolean,
    created_at: row.created_at as string,
  }
}

function mergeWithDemo(dbItems: Product[], filter: (p: Product) => boolean, limit: number): Product[] {
  const merged = mergeApprovedProducts(dbItems, DEMO_PRODUCTS)
    .map(enrichProductImages)
    .filter(filter)
  return merged.slice(0, limit)
}

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const featuredProducts = ref<Product[]>([])
  const bestsellers = ref<Product[]>([])
  const newArrivals = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const currentProduct = ref<Product | null>(null)
  const reviews = ref<ProductReview[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalProducts = ref(0)

  const activeProducts = computed(() =>
    products.value.filter((p) => p.status === 'approved')
  )

  async function fetchCategories() {
    const { data, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (fetchError || !data?.length) {
      categories.value = DEMO_CATEGORIES
      return
    }

    categories.value = data.map(mapCategory)
  }

  async function fetchFeaturedProducts(limit = 8) {
    loading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'approved')
        .eq('is_featured', true)
        .limit(limit)

      if (fetchError) throw fetchError

      featuredProducts.value = mergeWithDemo(
        (data as Product[]) || [],
        (p) => p.is_featured,
        limit
      )
      if (!featuredProducts.value.length) {
        featuredProducts.value = getDemoFeatured(limit)
      }
    } catch (e) {
      console.error('Error fetching featured products:', e)
      featuredProducts.value = getDemoFeatured(limit)
    } finally {
      loading.value = false
    }
  }

  async function fetchBestsellers(limit = 8) {
    loading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'approved')
        .eq('is_bestseller', true)
        .limit(limit)

      if (fetchError) throw fetchError

      bestsellers.value = mergeWithDemo(
        (data as Product[]) || [],
        (p) => p.is_bestseller,
        limit
      )
      if (!bestsellers.value.length) {
        bestsellers.value = getDemoBestsellers(limit)
      }
    } catch (e) {
      console.error('Error fetching bestsellers:', e)
      bestsellers.value = getDemoBestsellers(limit)
    } finally {
      loading.value = false
    }
  }

  async function fetchNewArrivals(limit = 8) {
    loading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'approved')
        .eq('is_new', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (fetchError) throw fetchError

      const dbNew = (data as Product[]) || []
      const localNew = getLocalApprovedProducts().filter((p) => p.is_new)
      newArrivals.value = mergeWithDemo([...dbNew, ...localNew], (p) => p.is_new, limit)
      if (!newArrivals.value.length) {
        newArrivals.value = getDemoNewArrivals(limit)
      }
    } catch (e) {
      console.error('Error fetching new arrivals:', e)
      newArrivals.value = getDemoNewArrivals(limit)
    } finally {
      loading.value = false
    }
  }

  async function fetchProducts(options?: {
    category_id?: string
    category_slug?: string
    brand?: string
    min_price?: number
    max_price?: number
    min_rating?: number
    search?: string
    sort?: string
    page?: number
    limit?: number
  }) {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('status', 'approved')

      if (options?.category_id) {
        query = query.eq('category_id', options.category_id)
      }

      if (options?.category_slug) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', options.category_slug)
          .single()

        if (category) {
          query = query.eq('category_id', category.id)
        }
      }

      if (options?.brand) {
        query = query.eq('brand', options.brand)
      }

      if (options?.min_price !== undefined) {
        query = query.gte('price', options.min_price)
      }

      if (options?.max_price !== undefined) {
        query = query.lte('price', options.max_price)
      }

      if (options?.min_rating !== undefined) {
        query = query.gte('rating', options.min_rating)
      }

      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
      }

      const sort = options?.sort || 'newest'
      switch (sort) {
        case 'price-asc':
          query = query.order('price', { ascending: true })
          break
        case 'price-desc':
          query = query.order('price', { ascending: false })
          break
        case 'rating':
          query = query.order('rating', { ascending: false })
          break
        case 'popular':
          query = query.order('review_count', { ascending: false })
          break
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false })
      }

      const page = options?.page || 1
      const limit = options?.limit || 20
      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query.range(from, to)

      const { data, count, error: fetchError } = await query

      if (fetchError) throw fetchError

      const dbProducts = (data as Product[]) || []
      if (dbProducts.length) {
        products.value = dbProducts
        totalProducts.value = count || dbProducts.length
      } else {
        products.value = options?.category_slug
          ? getDemoProductsByCategorySlug(options.category_slug)
          : DEMO_PRODUCTS
        totalProducts.value = products.value.length
      }

      return { data: products.value, total: totalProducts.value }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ürünler yüklenemedi'
      products.value = getDemoProductsByCategorySlug(options?.category_slug || '')
      totalProducts.value = products.value.length
      return { data: products.value, total: totalProducts.value }
    } finally {
      loading.value = false
    }
  }

  async function fetchProductById(id: string) {
    loading.value = true
    error.value = null

    const demo = getDemoProductById(id)
    const local = getLocalApprovedProducts().find((p) => p.id === id)
    if (demo || local) {
      currentProduct.value = (local || demo) as Product
      loading.value = false
      return currentProduct.value
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*, categories(name), users!products_seller_id_fkey(full_name, username)')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      currentProduct.value = enrichProductImages(data as Product)
      return currentProduct.value
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ürün yüklenemedi'
      currentProduct.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchProductReviews(productId: string, limit = 10) {
    try {
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('*, users(full_name, avatar_url)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (fetchError) throw fetchError

      reviews.value = data as ProductReview[]
      return data
    } catch (e) {
      console.error('Error fetching reviews:', e)
      return []
    }
  }

  async function addReview(review: {
    product_id: string
    rating: number
    title: string
    comment: string
  }) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Giriş yapmalısınız')

    const { data, error: insertError } = await supabase
      .from('reviews')
      .insert({
        ...review,
        user_id: user.id,
        is_verified_purchase: true,
      })
      .select()
      .single()

    if (insertError) throw insertError

    return data
  }

  async function searchProducts(query: string, limit = 10) {
    if (!query.trim()) return []

    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'approved')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
        .limit(limit)

      if (fetchError) throw fetchError

      return data as Product[]
    } catch (e) {
      console.error('Search error:', e)
      return []
    }
  }

  async function createProduct(product: Partial<Product>) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Giriş yapmalısınız')

    const slug = product.name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    try {
      const { data, error: insertError } = await supabase
        .from('products')
        .insert({
          ...product,
          seller_id: user.id,
          slug,
          status: 'pending',
          rating: 0,
          review_count: 0,
        })
        .select()
        .single()

      if (insertError) throw insertError

      return data
    } catch (insertError) {
      const localProduct: Product = {
        id: `local-${Date.now()}`,
        name: product.name || 'Yeni Ürün',
        slug: slug || `urun-${Date.now()}`,
        description: product.description || '',
        price: product.price || 0,
        discount_price: product.discount_price,
        stock: product.stock || 0,
        sku: product.sku || `SKU-${Date.now()}`,
        brand: product.brand || '',
        category_id: product.category_id || '',
        seller_id: user.id,
        images: product.images || [],
        specifications: product.specifications || {},
        status: 'pending',
        rating: 0,
        review_count: 0,
        is_featured: false,
        is_new: true,
        is_bestseller: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      addLocalPendingProduct(localProduct)
      return localProduct
    }
  }

  async function updateProduct(id: string, updates: Partial<Product>) {
    const { data, error: updateError } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    return data
  }

  async function deleteProduct(id: string) {
    const { error: deleteError } = await supabase.from('products').delete().eq('id', id)

    if (deleteError) throw deleteError
  }

  return {
    products,
    featuredProducts,
    bestsellers,
    newArrivals,
    categories,
    currentProduct,
    reviews,
    loading,
    error,
    totalProducts,
    activeProducts,
    fetchCategories,
    fetchFeaturedProducts,
    fetchBestsellers,
    fetchNewArrivals,
    fetchProducts,
    fetchProductById,
    fetchProductReviews,
    addReview,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  }
})
