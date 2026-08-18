import type { User } from '@/types'

export const DEMO_ADMIN_USER: User = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  email: 'admin@marketplace.com',
  full_name: 'Admin',
  username: 'admin',
  role: 'admin',
  is_seller: true,
  is_admin: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const DEMO_ADMIN_EMAIL = 'admin@marketplace.com'
export const DEMO_ADMIN_PASSWORD = 'admin123'

const DEMO_ADMIN_KEY = 'marketplace_demo_admin'

export function saveDemoAdminSession() {
  localStorage.setItem(DEMO_ADMIN_KEY, 'true')
}

export function clearDemoAdminSession() {
  localStorage.removeItem(DEMO_ADMIN_KEY)
}

export function isDemoAdminSession(): boolean {
  return localStorage.getItem(DEMO_ADMIN_KEY) === 'true'
}

export function isDemoAdminCredentials(email: string, password: string): boolean {
  return email.toLowerCase() === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD
}
