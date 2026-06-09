'use client'
import { useEffect, useRef } from 'react'
import { getDeviceCapability } from '@/lib/utils/deviceDetect'

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const ringPos = useRef({ x: 0, y: 0 })
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (getDeviceCapability() === 'mobile') return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      dot.style.left = e.clientX + 'px'
      dot.style.top = e.clientY + 'px'

      const target = e.target as HTMLElement
      if (target.closest('a, button, [role="button"]')) {
        ring.classList.add('hover-link')
        ring.classList.remove('hover-image')
      } else if (target.closest('[data-portfolio-img]')) {
        ring.classList.add('hover-image')
        ring.classList.remove('hover-link')
      } else {
        ring.classList.remove('hover-link', 'hover-image')
      }
    }

    const onClick = () => {
      if (!dot) return
      dot.style.transform = 'translate(-50%,-50%) scale(0.5)'
      setTimeout(() => { dot.style.transform = 'translate(-50%,-50%) scale(1)' }, 300)
    }

    let rafId: number
    const lerp = (a: number, b: number, n: number) => a + (b - a) * n

    const animate = () => {
      ringPos.current.x = lerp(ringPos.current.x, mouse.current.x, 0.12)
      ringPos.current.y = lerp(ringPos.current.y, mouse.current.y, 0.12)
      ring.style.left = ringPos.current.x + 'px'
      ring.style.top = ringPos.current.y + 'px'
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <>
      <div id="sbc-cursor-dot" ref={dotRef} />
      <div id="sbc-cursor-ring" ref={ringRef} />
    </>
  )
}
