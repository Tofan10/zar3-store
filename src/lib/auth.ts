import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')
  return token?.value === process.env.ADMIN_SECRET
}

export function getAdminSecret(): string {
  return process.env.ADMIN_SECRET || ''
}

// For external/third-party access to the public products API (src/app/api/v1/*).
// The caller sends their key in an `x-api-key` header.
export function checkApiKey(req: NextRequest): boolean {
  const key = req.headers.get('x-api-key')
  const validKey = process.env.PRODUCTS_API_KEY
  return !!validKey && key === validKey
}
