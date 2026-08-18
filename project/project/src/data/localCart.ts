import type { Product } from '@/types'
import type { CartItem, Favorite } from '@/types'

const CART_KEY = 'marketplace_local_cart'
const FAV_KEY = 'marketplace_local_favorites'

export function isOfflineProductId(id: string): boolean {
  return id.startsWith('demo-') || id.startsWith('local-')
}

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

function readFavorites(): Favorite[] {
  try {
    const raw = localStorage.getItem(FAV_KEY)
    return raw ? (JSON.parse(raw) as Favorite[]) : []
  } catch {
    return []
  }
}

function writeFavorites(items: Favorite[]) {
  localStorage.setItem(FAV_KEY, JSON.stringify(items))
}

export function getLocalCartItems(): CartItem[] {
  return readCart()
}

export function addToLocalCart(product: Product, quantity = 1): CartItem[] {
  const items = readCart()
  const existing = items.find((i) => i.product_id === product.id)

  if (existing) {
    existing.quantity += quantity
    existing.product = product
  } else {
    items.push({
      id: `cart-${product.id}`,
      user_id: 'local',
      product_id: product.id,
      quantity,
      product,
      created_at: new Date().toISOString(),
    })
  }

  writeCart(items)
  return items
}

export function updateLocalCartQuantity(itemId: string, quantity: number): CartItem[] {
  let items = readCart()
  if (quantity < 1) {
    items = items.filter((i) => i.id !== itemId)
  } else {
    const item = items.find((i) => i.id === itemId)
    if (item) item.quantity = quantity
  }
  writeCart(items)
  return items
}

export function removeFromLocalCart(itemId: string): CartItem[] {
  const items = readCart().filter((i) => i.id !== itemId)
  writeCart(items)
  return items
}

export function clearLocalCart() {
  localStorage.removeItem(CART_KEY)
}

export function getLocalFavorites(): Favorite[] {
  return readFavorites()
}

export function toggleLocalFavorite(product: Product): { added: boolean; items: Favorite[] } {
  const items = readFavorites()
  const existing = items.find((i) => i.product_id === product.id)

  if (existing) {
    const filtered = items.filter((i) => i.product_id !== product.id)
    writeFavorites(filtered)
    return { added: false, items: filtered }
  }

  const entry: Favorite = {
    id: `fav-${product.id}`,
    user_id: 'local',
    product_id: product.id,
    product,
    created_at: new Date().toISOString(),
  }
  items.unshift(entry)
  writeFavorites(items)
  return { added: true, items }
}

export function removeLocalFavorite(favoriteId: string): Favorite[] {
  const items = readFavorites().filter((i) => i.id !== favoriteId)
  writeFavorites(items)
  return items
}

export function mergeCartItems(dbItems: CartItem[], localItems: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>()
  for (const item of dbItems) map.set(item.product_id, item)
  for (const item of localItems) {
    const existing = map.get(item.product_id)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      map.set(item.product_id, item)
    }
  }
  return Array.from(map.values())
}

export function mergeFavorites(dbItems: Favorite[], localItems: Favorite[]): Favorite[] {
  const map = new Map<string, Favorite>()
  for (const item of dbItems) map.set(item.product_id, item)
  for (const item of localItems) map.set(item.product_id, item)
  return Array.from(map.values())
}
