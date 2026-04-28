import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!await checkAdminAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = buffer.toString('base64')
  const dataUri = `data:${file.type};base64,${base64}`

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dpqc6emvh'
  const apiKey = process.env.CLOUDINARY_API_KEY || '441417361158369'
  const apiSecret = process.env.CLOUDINARY_API_SECRET || 'uar_60a_7ZjtkrJqkfBG_KCz3eE'

  const timestamp = Math.round(Date.now() / 1000)
  const folder = 'zar3-products'

  const crypto = await import('crypto')
  const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
  const signature = crypto.createHash('sha1').update(signatureString).digest('hex')

  const uploadData = new FormData()
  uploadData.append('file', dataUri)
  uploadData.append('api_key', apiKey)
  uploadData.append('timestamp', timestamp.toString())
  uploadData.append('signature', signature)
  uploadData.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: uploadData,
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json({ error: data.error?.message || 'Upload failed' }, { status: 500 })
  }

  return NextResponse.json({ url: data.secure_url })
}
