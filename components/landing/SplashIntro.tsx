'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

interface SplashIntroProps {
  onComplete: () => void
}

export function SplashIntro({ onComplete }: SplashIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('sbc_splash_shown')) {
      onComplete()
      return
    }

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('sbc_splash_shown', 'true')
        gsap.to(containerRef.current, {
          opacity: 0, duration: 0.3, delay: 0.1,
          onComplete: () => onComplete(),
        })
      },
    })

    tl.fromTo(logoRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 0.2
    )
    .fromTo(taglineRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 }, 0.8
    )
    .to(logoRef.current, {
      top: '24px',
      left: '24px',
      xPercent: 0,
      yPercent: 0,
      scale: 0.5,
      duration: 0.5,
      ease: 'power2.inOut',
    }, 1.8)

  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
    >
      <div className="text-center">
        <div
          ref={logoRef}
          className="font-montserrat font-bold text-5xl text-white mb-4"
          style={{ position: 'relative' }}
        >
          SBC.id
        </div>
        <p
          ref={taglineRef}
          className="font-inter text-sm italic opacity-0"
          style={{ color: '#9CA3AF' }}
        >
          a better choice for a better habit
        </p>
      </div>
    </div>
  )
}
