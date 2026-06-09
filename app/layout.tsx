import type { Metadata } from 'next'
import { Montserrat, Inter } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'SBC.id — SpundbondCraft | Custom Spunbond Bag Solo',
  description: 'Jasa customize tas spunbond ultra-flexible. Atelier-grade customization, eco circular. Solo, Indonesia.',
  openGraph: {
    title: 'SBC.id — SpundbondCraft',
    description: 'Every great bag starts with an idea — share yours.',
    url: 'https://spundbondcraft.vercel.app',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${montserrat.variable} ${inter.variable}`}>
      <body className="bg-white text-near-black antialiased">{children}</body>
    </html>
  )
}
