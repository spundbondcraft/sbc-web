import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(
  file: string | Buffer,
  folder: string,
  publicId?: string
): Promise<{ url: string; publicId: string; blurDataUrl?: string }> {
  const opts: Record<string, unknown> = {
    folder: `sbc/${folder}`,
    resource_type: 'auto',
  }
  if (publicId) opts.public_id = publicId

  const result = await cloudinary.uploader.upload(
    typeof file === 'string' ? file : `data:application/octet-stream;base64,${file.toString('base64')}`,
    opts
  )

  const blurUrl = cloudinary.url(result.public_id, {
    transformation: [{ width: 20, quality: 'auto', fetch_format: 'auto' }],
  })

  return { url: result.secure_url, publicId: result.public_id, blurDataUrl: blurUrl }
}

export async function deleteImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId)
}

export { cloudinary }
