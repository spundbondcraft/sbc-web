'use client'
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { CustomCursor } from '@/components/landing/CustomCursor'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])

  return (
    <>
      <CustomCursor />
      {children}
    </>
  )
}
