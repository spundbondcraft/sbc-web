'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { MessageCircle } from 'lucide-react'
import { ParticleField } from './ParticleField'

export function HeroSection() {
  const wordsRef = useRef<HTMLSpanElement[]>([])
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER ?? ''

  useEffect(() => {
    const words = wordsRef.current.filter(Boolean)
    const tl = gsap.timeline({ delay: 0.3 })

    tl.fromTo(words,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' }
    )
    .fromTo(subRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2'
    )
    .fromTo(ctaRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.1'
    )

    // Pulse CTA
    gsap.to(ctaRef.current, {
      boxShadow: '0 0 0 12px rgba(232,71,10,0)',
      repeat: -1,
      duration: 2,
      ease: 'power1.out',
    })

    // Fade scroll indicator on scroll
    const onScroll = () => {
      if (scrollRef.current) {
        scrollRef.current.style.opacity = String(1 - window.scrollY / 200)
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const headline = 'drop your idea here'.split(' ')

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden" style={{ background: '#0D1F00' }}>
      <ParticleField />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <h1
          className="font-montserrat font-bold text-white mb-6 leading-tight"
          style={{ fontSize: 'clamp(48px, 8vw, 96px)', letterSpacing: '-0.02em' }}
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
        </h1>

        <p
          ref={subRef}
          className="font-inter text-gray-400 mb-10 opacity-0"
          style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}
        >
          ultra-flexible customize spunbond bag — Solo, Indonesia
        </p>

        <a
          ref={ctaRef}
          href={`https://wa.me/${waNumber}?text=Halo%20SBC.id%2C%20saya%20ingin%20berdiskusi%20tentang%20custom%20tas%20spunbond`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-montserrat font-semibold text-white rounded-full opacity-0 transition-transform hover:scale-105"
          style={{
            background: '#E8470A',
            padding: '14px 36px',
            fontSize: '16px',
            boxShadow: '0 0 0 0 rgba(232,71,10,0.4)',
          }}
        >
          <MessageCircle size={18} />
          Chat with us
        </a>
      </div>

      <div
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: '#9CA3AF' }}
      >
        <span className="font-inter text-xs">scroll to explore</span>
        <div className="animate-bounce text-sbc-orange">↓</div>
      </div>
    </section>
  )
}
