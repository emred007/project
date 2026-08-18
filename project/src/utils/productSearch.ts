import type { Product } from '@/types'

export function normalizeSearchText(value: string): string {
  return value.trim().toLocaleLowerCase('tr-TR')
}

export function productMatchesSearch(product: Product, query: string): boolean {
  const q = normalizeSearchText(query)
  if (!q) return true

  return product.name.toLocaleLowerCase('tr-TR').includes(q)
}

export function filterProductsBySearch(products: Product[], query: string): Product[] {
  const q = normalizeSearchText(query)
  if (!q) return products
  return products.filter((product) => productMatchesSearch(product, q))
}