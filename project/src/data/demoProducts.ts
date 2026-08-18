import type { Category, Product } from '@/types'

const now = new Date().toISOString()
const DEMO_SELLER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

export const ELECTRONICS_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1920&q=80'

export const ELECTRONICS_CATEGORY_IMAGE =
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80'

export const XIAOMI_NOTE_13_PRO_IMAGE =
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'

export const KINDLE_PAPERWHITE_IMAGE =
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'

const BROKEN_IMAGE_SNIPPETS = ['1092678', '163100', '1598327105666', '159711']

export function enrichProductImages(product: Product): Product {
  const demo = DEMO_PRODUCTS.find((p) => p.slug === product.slug)
  const image = product.images?.[0]
  const isBroken = !image || BROKEN_IMAGE_SNIPPETS.some((part) => image.includes(part))

  if (!isBroken) {
    if (product.is_new) return { ...product, discount_price: undefined }
    return product
  }
  if (demo?.images?.[0]) {
    const merged = { ...product, images: demo.images }
    if (merged.is_new) merged.discount_price = undefined
    return merged
  }

  if (product.is_new) return { ...product, discount_price: undefined }
  return product
}

export const DEMO_CATEGORIES: Category[] = [
  { id: '11111111-1111-1111-1111-111111111001', name: 'Elektronik', slug: 'elektronik', description: 'Elektronik ürünler', image_url: ELECTRONICS_CATEGORY_IMAGE, order: 1, is_active: true, created_at: now },
  { id: '11111111-1111-1111-1111-111111111002', name: 'Moda', slug: 'moda', description: 'Giyim ve aksesuar', image_url: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=800', order: 2, is_active: true, created_at: now },
  { id: '11111111-1111-1111-1111-111111111003', name: 'Ev & Yaşam', slug: 'ev-yasam', description: 'Ev dekorasyon', image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800', order: 3, is_active: true, created_at: now },
  { id: '11111111-1111-1111-1111-111111111004', name: 'Spor', slug: 'spor', description: 'Spor ürünleri', image_url: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=800', order: 4, is_active: true, created_at: now },
  { id: '11111111-1111-1111-1111-111111111005', name: 'Kozmetik', slug: 'kozmetik', description: 'Güzellik', image_url: 'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=800', order: 5, is_active: true, created_at: now },
  { id: '11111111-1111-1111-1111-111111111006', name: 'Kitap', slug: 'kitap', description: 'Kitap', image_url: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800', order: 6, is_active: true, created_at: now },
  { id: '11111111-1111-1111-1111-111111111007', name: 'Oyuncak', slug: 'oyuncak', description: 'Oyuncak', image_url: 'https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=800', order: 7, is_active: true, created_at: now },
  { id: '11111111-1111-1111-1111-111111111008', name: 'Otomotiv', slug: 'otomotiv', description: 'Otomotiv', image_url: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800', order: 8, is_active: true, created_at: now },
]

function product(p: Partial<Product> & Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'stock' | 'brand' | 'category_id' | 'images' | 'is_featured' | 'is_bestseller' | 'is_new'>): Product {
  const item = {
    description: '',
    sku: '',
    seller_id: DEMO_SELLER_ID,
    status: 'approved' as const,
    rating: 4.5,
    review_count: 128,
    specifications: {},
    created_at: now,
    updated_at: now,
    ...p,
  }

  if (item.is_new) {
    item.discount_price = undefined
  }

  return item
}

export const DEMO_PRODUCTS: Product[] = [
  product({
    id: 'demo-001', name: 'iPhone 15 Pro 256GB', slug: 'iphone-15-pro-256gb',
    description: 'A17 Pro çip, titanyum tasarım, 48MP kamera.',
    price: 64999, discount_price: 59999, stock: 45, sku: 'IPH15P-256', brand: 'Apple',
    category_id: '11111111-1111-1111-1111-111111111001',
    images: ['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600'],
    is_featured: true, is_bestseller: true, is_new: true, rating: 4.9, review_count: 342,
  }),
  product({
    id: 'demo-002', name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra',
    description: 'S Pen destekli amiral gemisi telefon.',
    price: 54999, discount_price: 49999, stock: 32, sku: 'SGS24U-512', brand: 'Samsung',
    category_id: '11111111-1111-1111-1111-111111111001',
    images: ['https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=600'],
    is_featured: true, is_bestseller: true, is_new: false, rating: 4.8, review_count: 256,
  }),
  product({
    id: 'demo-003', name: 'MacBook Air M3 13"', slug: 'macbook-air-m3-13',
    description: 'Ultra ince, güçlü M3 işlemci, 18 saat pil.',
    price: 42999, discount_price: 39999, stock: 18, sku: 'MBA-M3-13', brand: 'Apple',
    category_id: '11111111-1111-1111-1111-111111111001',
    images: ['https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600'],
    is_featured: true, is_bestseller: false, is_new: true, rating: 4.7, review_count: 189,
  }),
  product({
    id: 'demo-004', name: 'Sony WH-1000XM5 Kulaklık', slug: 'sony-wh-1000xm5',
    description: 'Industry leading gürültü engelleme.',
    price: 12999, discount_price: 10999, stock: 67, sku: 'SONY-XM5', brand: 'Sony',
    category_id: '11111111-1111-1111-1111-111111111001',
    images: ['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600'],
    is_featured: true, is_bestseller: true, is_new: false, rating: 4.9, review_count: 512,
  }),
  product({
    id: 'demo-005', name: 'Nike Air Max 270', slug: 'nike-air-max-270',
    description: 'Günlük kullanım için konforlu spor ayakkabı.',
    price: 4999, discount_price: 3499, stock: 120, sku: 'NIKE-AM270', brand: 'Nike',
    category_id: '11111111-1111-1111-1111-111111111004',
    images: ['https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=600'],
    is_featured: true, is_bestseller: true, is_new: false, rating: 4.6, review_count: 890,
  }),
  product({
    id: 'demo-006', name: 'Adidas Originals Hoodie', slug: 'adidas-originals-hoodie',
    description: 'Pamuklu, rahat kesim kapüşonlu sweatshirt.',
    price: 2499, discount_price: 1799, stock: 85, sku: 'ADID-HOOD', brand: 'Adidas',
    category_id: '11111111-1111-1111-1111-111111111002',
    images: ['https://images.pexels.com/photos/7671166/pexels-photo-7671166.jpeg?auto=compress&cs=tinysrgb&w=600'],
    is_featured: true, is_bestseller: false, is_new: true, rating: 4.5, review_count: 234,
  }),
  product({
    id: 'demo-007', name: 'Dyson V15 Detect Süpürge', slug: 'dyson-v15-detect',
    description: 'Lazer toz algılama teknolojisi.',
    price: 24999, discount_price: 21999, stock: 14, sku: 'DYS-V15', brand: 'Dyson',
    category_id: '11111111-1111-1111-1111-111111111003',
    images: ['https://images.pexels.com/photos/4108710/pexels-photo-4108710.jpeg?auto=compress&cs=tinysrgb&w=600'],
    is_featured: true, is_bestseller: true, is_new: false, rating: 4.8, review_count: 167,
  }),
  product({
    id: 'demo-008', name: 'Xiaomi Redmi Note 13 Pro', slug: 'xiaomi-redmi-note-13-pro',
    description: '200MP kamera, 120Hz AMOLED ekran.',
    price: 14999, discount_price: 12999, stock: 95, sku: 'XM-RN13P', brand: 'Xiaomi',
    category_id: '11111111-1111-1111-1111-111111111001',
    images: [XIAOMI_NOTE_13_PRO_IMAGE],
    is_featured: true, is_bestseller: true, is_new: true, rating: 4.4, review_count: 445,
  }),
  product({
    id: 'demo-009', name: 'L\'Oréal Paris Revitalift Serum', slug: 'loreal-revitalift-serum',
    description: 'Anti-aging cilt bakım serumu 30ml.',
    price: 899, discount_price: 649, stock: 200, sku: 'LOR-REV30', brand: 'L\'Oréal',
    category_id: '11111111-1111-1111-1111-111111111005',
    images: ['https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=600'],
    is_featured: false, is_bestseller: true, is_new: true, rating: 4.3, review_count: 678,
  }),
  product({
    id: 'demo-010', name: 'Lenovo IdeaPad Gaming 3', slug: 'lenovo-ideapad-gaming-3',
    description: 'RTX 4050, 144Hz ekran, oyun laptopu.',
    price: 32999, discount_price: 28999, stock: 22, sku: 'LEN-IPG3', brand: 'Lenovo',
    category_id: '11111111-1111-1111-1111-111111111001',
    images: ['https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600'],
    is_featured: false, is_bestseller: true, is_new: true, rating: 4.5, review_count: 98,
  }),
  product({
    id: 'demo-011', name: 'Zara Oversize Blazer Ceket', slug: 'zara-oversize-blazer',
    description: 'Şık oversize kesim blazer ceket.',
    price: 3299, discount_price: 2499, stock: 40, sku: 'ZARA-BLZ', brand: 'Zara',
    category_id: '11111111-1111-1111-1111-111111111002',
    images: ['https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=600'],
    is_featured: false, is_bestseller: false, is_new: true, rating: 4.2, review_count: 56,
  }),
  product({
    id: 'demo-012', name: 'Philips Airfryer XXL', slug: 'philips-airfryer-xxl',
    description: 'Yağsız pişirme, 6.2L kapasite.',
    price: 8999, discount_price: 7499, stock: 55, sku: 'PHI-AFXXL', brand: 'Philips',
    category_id: '11111111-1111-1111-1111-111111111003',
    images: ['https://images.pexels.com/photos/4493661/pexels-photo-4493661.jpeg?auto=compress&cs=tinysrgb&w=600'],
    is_featured: false, is_bestseller: true, is_new: false, rating: 4.7, review_count: 1203,
  }),
  product({
    id: 'demo-013', name: 'Under Armour Spor Tayt', slug: 'under-armour-spor-tayt',
    description: 'Nefes alabilir kumaş, yüksek bel.',
    price: 1899, discount_price: 1299, stock: 75, sku: 'UA-TAYT', brand: 'Under Armour',
    category_id: '11111111-1111-1111-1111-111111111004',
    images: ['https://images.pexels.com/photos/3076516/pexels-photo-3076516.jpeg?auto=compress&cs=tinysrgb&w=600'],
    is_featured: false, is_bestseller: true, is_new: true, rating: 4.4, review_count: 312,
  }),
  product({
    id: 'demo-014', name: 'Kindle Paperwhite 16GB', slug: 'kindle-paperwhite-16gb',
    description: 'Su geçirmez e-okuyucu, ayarlanabilir sıcaklık.',
    price: 5499, discount_price: 4799, stock: 38, sku: 'KIN-PW16', brand: 'Amazon',
    category_id: '11111111-1111-1111-1111-111111111006',
    images: [KINDLE_PAPERWHITE_IMAGE],
    is_featured: false, is_bestseller: false, is_new: true, rating: 4.8, review_count: 445,
  }),
  product({
    id: 'demo-015', name: 'LEGO Star Wars X-Wing', slug: 'lego-star-wars-xwing',
    description: '734 parça, koleksiyonluk set.',
    price: 3999, discount_price: 3299, stock: 28, sku: 'LEGO-XWING', brand: 'LEGO',
    category_id: '11111111-1111-1111-1111-111111111007',
    images: ['https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=600'],
    is_featured: false, is_bestseller: true, is_new: true, rating: 4.9, review_count: 89,
  }),
  product({
    id: 'demo-016', name: 'Bosch Akü Şarj Cihazı', slug: 'bosch-aku-sarj-cihazi',
    description: '12V/24V uyumlu akıllı şarj.',
    price: 3499, discount_price: 2799, stock: 42, sku: 'BOS-CHG', brand: 'Bosch',
    category_id: '11111111-1111-1111-1111-111111111008',
    images: ['https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=600'],
    is_featured: false, is_bestseller: false, is_new: true, rating: 4.6, review_count: 134,
  }),
]

export function getDemoProductBySlug(slug: string): Product | undefined {
  return DEMO_PRODUCTS.find((p) => p.slug === slug)
}

export function resolveProductImage(product: Pick<Product, 'slug' | 'images'>): string {
  const enriched = enrichProductImages(product as Product)
  return enriched.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image'
}

export function getDemoFeatured(limit = 8): Product[] {
  return DEMO_PRODUCTS.filter((p) => p.is_featured).slice(0, limit)
}

export function getDemoBestsellers(limit = 8): Product[] {
  return DEMO_PRODUCTS.filter((p) => p.is_bestseller).slice(0, limit)
}

export function getDemoNewArrivals(limit = 8): Product[] {
  return DEMO_PRODUCTS.filter((p) => p.is_new).slice(0, limit)
}

export function getDemoProductById(id: string): Product | undefined {
  return DEMO_PRODUCTS.find((p) => p.id === id)
}

export function getDemoProductsByCategorySlug(slug: string): Product[] {
  const cat = DEMO_CATEGORIES.find((c) => c.slug === slug)
  if (!cat) return DEMO_PRODUCTS
  return DEMO_PRODUCTS.filter((p) => p.category_id === cat.id)
}
