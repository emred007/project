import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { Product, Category, ProductReview, Banner } from '@/types'
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
  getLocalApprovedProducts,
} from '@/data/localProducts'
import {
  filterProductsBySearch,
  productMatchesSearch,
} from '@/utils/productSearch'

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

function mapBanner(row: Record<string, unknown>): Banner {
  return {
    id: row.id as string,
    title: row.title as string,
    subtitle: row.subtitle as string | undefined,
    image_url: row.image_url as string,
    link_url: row.link_url as string | undefined,
    button_text: row.button_text as string | undefined,
    order: (row.sort_order as number) ?? 0,
    is_active: row.is_active as boolean,
    start_date: row.start_date as string | undefined,
    end_date: row.end_date as string | undefined,
    created_at: row.created_at as string,
  }
}

function mergeCatalogProducts(dbProducts: Product[]): Product[] {
  const localApproved = getLocalApprovedProducts()
  const map = new Map<string, Product>()

  for (const p of dbProducts) map.set(p.id, p)
  for (const p of localApproved) map.set(p.id, p)

  return Array.from(map.values())
}

function mergeWithDemo(dbItems: Product[], filter: (p: Product) => boolean, limit: number): Product[] {
  const merged = mergeCatalogProducts(dbItems)
    .map(enrichProductImages)
    .filter(filter)
  return merged.slice(0, limit)
}

type ProductQueryOptions = {
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
}

function getEffectivePrice(product: Product): number {
  return product.discount_price ?? product.price
}

/** Seçilen yıldız kademesine uyan ürünleri döndürür (ör. 4 yıldız = 3.5–4.5 arası). */
function matchesRatingFilter(rating: number, selectedStars: number): boolean {
  if (selectedStars <= 0) return true
  if (selectedStars >= 5) return rating >= 4.5
  const min = selectedStars - 0.5
  const max = selectedStars + 0.5
  return rating >= min && rating < max
}

function sortProductList(list: Product[], sort?: string): Product[] {
  const sorted = [...list]
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b))
    case 'price-desc':
      return sorted.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a))
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'popular':
      return sorted.sort((a, b) => b.review_count - a.review_count)
    case 'newest':
    default:
      return sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
  }
}

function filterProductList(products: Product[], options?: ProductQueryOptions): Product[] {
  let result = products.map(enrichProductImages)

  if (options?.category_id) {
    result = result.filter((p) => p.category_id === options.category_id)
  }

  if (options?.category_slug) {
    const cat = DEMO_CATEGORIES.find((c) => c.slug === options.category_slug)
    if (cat) result = result.filter((p) => p.category_id === cat.id)
  }

  if (options?.brand) {
    const brands = options.brand.split(',')
    result = result.filter((p) => p.brand && brands.includes(p.brand))
  }

  if (options?.min_price !== undefined) {
    result = result.filter((p) => getEffectivePrice(p) >= options.min_price!)
  }

  if (options?.max_price !== undefined) {
    result = result.filter((p) => getEffectivePrice(p) <= options.max_price!)
  }

  if (options?.min_rating !== undefined && options.min_rating > 0) {
    result = result.filter((p) => matchesRatingFilter(p.rating, options.min_rating!))
  }

  if (options?.search) {
    result = filterProductsBySearch(result, options.search)
  }

  return sortProductList(result, options?.sort)
}

function paginateProductList(list: Product[], page = 1, limit = 20): Product[] {
  const from = (page - 1) * limit
  return list.slice(from, from + limit)
}

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const featuredProducts = ref<Product[]>([])
  const bestsellers = ref<Product[]>([])
  const newArrivals = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const banners = ref<Banner[]>([])
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

  async function fetchBanners() {
    const { data, error: fetchError } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (fetchError || !data?.length) {
      banners.value = []
      return
    }

    banners.value = data.map(mapBanner)
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
      newArrivals.value = mergeWithDemo(dbNew, (p) => p.is_new, limit)
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

  async function fetchProducts(options?: ProductQueryOptions) {
    loading.value = true
    error.value = null

    const demoBase = options?.category_slug
      ? getDemoProductsByCategorySlug(options.category_slug)
      : DEMO_PRODUCTS

    try {
      let query = supabase.from('products').select('*').eq('status', 'approved')

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

      const { data, error: fetchError } = await query

      let base: Product[]
      if (!fetchError) {
        const dbProducts = (data as Product[]) || []
        if (options?.search) {
          base = mergeCatalogProducts([
            ...dbProducts,
            ...demoBase,
            ...getLocalApprovedProducts(),
          ])
        } else {
          base = mergeCatalogProducts(dbProducts)
          if (base.length === 0) {
            base = demoBase
          }
        }
      } else {
        base = mergeCatalogProducts(options?.search ? [...demoBase, ...getLocalApprovedProducts()] : demoBase)
      }

      const filtered = filterProductList(base, options)
      const pageNum = options?.page || 1
      const limitNum = options?.limit || 20
      products.value = paginateProductList(filtered, pageNum, limitNum)
      totalProducts.value = filtered.length

      return { data: products.value, total: totalProducts.value }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ürünler yüklenemedi'
      const base = mergeCatalogProducts(
        options?.search ? [...demoBase, ...getLocalApprovedProducts()] : getDemoProductsByCategorySlug(options?.category_slug || '')
      )
      const filtered = filterProductList(base, options)
      const pageNum = options?.page || 1
      const limitNum = options?.limit || 20
      products.value = paginateProductList(filtered, pageNum, limitNum)
      totalProducts.value = filtered.length
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
    const trimmed = query.trim()
    if (!trimmed) return []

    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'approved')

      const dbResults = fetchError ? [] : ((data as Product[]) || [])
      const merged = mergeCatalogProducts([
        ...dbResults,
        ...DEMO_PRODUCTS,
        ...getLocalApprovedProducts(),
      ])

      const seen = new Set<string>()
      const results: Product[] = []
      for (const product of merged.map(enrichProductImages)) {
        if (!productMatchesSearch(product, trimmed)) continue
        if (seen.has(product.id)) continue
        seen.add(product.id)
        results.push(product)
        if (results.length >= limit) break
      }

      return results
    } catch (e) {
      console.error('Search error:', e)
      return filterProductsBySearch(
        mergeCatalogProducts([...DEMO_PRODUCTS, ...getLocalApprovedProducts()]).map(enrichProductImages),
        trimmed
      ).slice(0, limit)
    }
  }

  async function createProduct(product: Partial<Product>) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Giriş yapmalısınız')

    const baseSlug = product.name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'urun'
    const slug = `${baseSlug}-${Date.now().toString(36)}`

    const { data, error: insertError } = await supabase
      .from('products')
      .insert({
        ...product,
        seller_id: user.id,
        slug,
        status: 'pending',
        is_new: true,
        rating: 0,
        review_count: 0,
      })
      .select()
      .single()

    if (insertError) throw insertError

    return data
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
    banners,
    currentProduct,
    reviews,
    loading,
    error,
    totalProducts,
    activeProducts,
    fetchCategories,
    fetchBanners,
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
