'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { gsap } from 'gsap'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(13,31,0,0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-montserrat font-bold text-xl text-white tracking-tight">
          SBC.id
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { href: '#how-it-works', label: 'How it works' },
            { href: '#portfolio', label: 'Portfolio' },
            { href: '#eco', label: 'Eco circular' },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              className="font-inter text-sm text-white/80 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/track"
            className="font-inter text-sm text-white border border-sbc-orange rounded-full px-4 py-1.5 hover:bg-sbc-orange transition-all duration-200"
          >
            Track order
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 flex flex-col"
          style={{ background: '#0D1F00' }}
        >
          <div className="flex justify-end p-6">
            <button className="text-white" onClick={() => setMobileOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <div className="flex flex-col items-center gap-8 mt-8">
            {[
              { href: '#how-it-works', label: 'How it works' },
              { href: '#portfolio', label: 'Portfolio' },
              { href: '#eco', label: 'Eco circular' },
              { href: '/track', label: 'Track order' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                className="font-montserrat font-semibold text-2xl text-white"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
