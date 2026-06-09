/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
}

module.exports = nextConfig
