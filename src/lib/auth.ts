import { cookies } from 'next/headers'

export function checkAdminAuth(): boolean {
  const cookieStore = cookies()
  const token = cookieStore.get('admin_token')
  return token?.value === process.env.ADMIN_SECRET
}

export function getAdminSecret(): string {
  return process.env.ADMIN_SECRET || ''
}
