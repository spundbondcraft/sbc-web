'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { getDeviceCapability } from '@/lib/utils/deviceDetect'

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null)
  const btnRef = useRef<HTMLAnchorElement>(null)
  const wordsRef = useRef<HTMLSpanElement[]>([])
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER ?? ''

  useEffect(() => {
    const btn = btnRef.current
    const capability = getDeviceCapability()

    // Animate headline words
    gsap.fromTo(wordsRef.current.filter(Boolean),
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      }
    )

    // Diagonal follows cursor on desktop
    const section = sectionRef.current
    if (capability === 'desktop' && section) {
      const onMove = (e: MouseEvent) => {
        const rect = section.getBoundingClientRect()
        const cx = (e.clientX - rect.left) / rect.width - 0.5
        const cy = (e.clientY - rect.top) / rect.height - 0.5
        gsap.to(section.querySelector('.diagonal-left'), { skewX: cx * 3, duration: 0.5 })
        gsap.to(section.querySelector('.diagonal-right'), { skewX: cx * 3, duration: 0.5 })
      }
      section.addEventListener('mousemove', onMove)
      return () => section.removeEventListener('mousemove', onMove)
    }

    // Magnetic button (desktop only)
    if (capability === 'desktop' && btn) {
      const RADIUS = 100
      const STRENGTH = 0.4

      const onMove = (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = e.clientX - cx
        const dy = e.clientY - cy
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < RADIUS) {
          gsap.to(btn, { x: dx * STRENGTH, y: dy * STRENGTH, duration: 0.3, ease: 'power2.out' })
        } else {
          gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' })
        }
      }

      window.addEventListener('mousemove', onMove)
      return () => window.removeEventListener('mousemove', onMove)
    }
  }, [])

  const headline = 'Every great bag starts with an idea.'.split(' ')

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Diagonal background */}
      <div
        className="diagonal-left absolute inset-0"
        style={{
          background: '#0D1F00',
          clipPath: 'polygon(0 0, 55% 0, 45% 100%, 0 100%)',
        }}
      />
      <div
        className="diagonal-right absolute inset-0"
        style={{
          background: '#E8470A',
          clipPath: 'polygon(55% 0, 100% 0, 100% 100%, 45% 100%)',
        }}
      />

      <div className="relative z-10 text-center px-8 max-w-3xl mx-auto">
        <h2
          className="font-montserrat font-bold text-white mb-4"
          style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
        >
          {headline.map((word, i) => (
            <span
              key={i}
              ref={(el) => { if (el) wordsRef.current[i] = el }}
              className="inline-block opacity-0 mr-[0.25em]"
            >
              {word}
            </span>
          ))}
        </h2>

        <p
          className="font-inter italic text-white/80 mb-12"
          style={{ fontSize: '24px', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
        >
          — share yours —
        </p>

        <a
          ref={btnRef}
          href={`https://wa.me/${waNumber}?text=Halo%20SBC.id%2C%20saya%20ingin%20berbagi%20ide`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-montserrat font-semibold rounded-full transition-shadow hover:shadow-xl"
          style={{
            background: '#FFFFFF',
            color: '#1A1A1A',
            fontSize: '18px',
            padding: '18px 48px',
          }}
        >
          It starts with a simple hello
        </a>
      </div>
    </section>
  )
}
