import type { Product, ProductStatus } from '@/types'

const PENDING_KEY = 'marketplace_pending_products'
const APPROVED_LOCAL_KEY = 'marketplace_approved_local'

function readStore(key: string): Product[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as Product[]) : []
  } catch {
    return []
  }
}

function writeStore(key: string, products: Product[]) {
  localStorage.setItem(key, JSON.stringify(products))
}

export function getLocalPendingProducts(): Product[] {
  return readStore(PENDING_KEY)
}

export function getLocalApprovedProducts(): Product[] {
  return readStore(APPROVED_LOCAL_KEY)
}

export function addLocalPendingProduct(product: Product) {
  const list = getLocalPendingProducts()
  list.unshift(product)
  writeStore(PENDING_KEY, list)
}

export function approveLocalProduct(productId: string, flags?: { is_featured?: boolean; is_bestseller?: boolean; is_new?: boolean }) {
  const pending = getLocalPendingProducts()
  const index = pending.findIndex((p) => p.id === productId)
  if (index === -1) return null

  const approved: Product = {
    ...pending[index],
    status: 'approved',
    is_featured: flags?.is_featured ?? pending[index].is_featured,
    is_bestseller: flags?.is_bestseller ?? pending[index].is_bestseller,
    is_new: flags?.is_new ?? pending[index].is_new,
    updated_at: new Date().toISOString(),
  }

  pending.splice(index, 1)
  writeStore(PENDING_KEY, pending)

  const approvedList = getLocalApprovedProducts()
  approvedList.unshift(approved)
  writeStore(APPROVED_LOCAL_KEY, approvedList)

  return approved
}

export function rejectLocalProduct(productId: string, reason: string) {
  const pending = getLocalPendingProducts()
  const index = pending.findIndex((p) => p.id === productId)
  if (index === -1) return null

  pending[index] = {
    ...pending[index],
    status: 'rejected',
    rejection_reason: reason,
    updated_at: new Date().toISOString(),
  }

  const rejected = pending.splice(index, 1)[0]
  writeStore(PENDING_KEY, pending)
  return rejected
}

export function updateLocalProductFlags(productId: string, flags: Partial<Pick<Product, 'is_featured' | 'is_bestseller' | 'is_new'>>) {
  const approved = getLocalApprovedProducts()
  const index = approved.findIndex((p) => p.id === productId)
  if (index === -1) return null

  approved[index] = { ...approved[index], ...flags, updated_at: new Date().toISOString() }
  writeStore(APPROVED_LOCAL_KEY, approved)
  return approved[index]
}

export function getLocalSellerProducts(sellerId: string): Product[] {
  return [
    ...getLocalPendingProducts().filter((p) => p.seller_id === sellerId),
    ...getLocalApprovedProducts().filter((p) => p.seller_id === sellerId),
  ]
}

export function isLocalProductId(id: string): boolean {
  return id.startsWith('local-') || id.startsWith('demo-')
}

export function mergeApprovedProducts(dbProducts: Product[], demoProducts: Product[]): Product[] {
  const localApproved = getLocalApprovedProducts()
  const map = new Map<string, Product>()

  for (const p of demoProducts) map.set(p.id, p)
  for (const p of dbProducts) map.set(p.id, p)
  for (const p of localApproved) map.set(p.id, p)

  return Array.from(map.values())
}
