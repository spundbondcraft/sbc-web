'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0)
  const triggered = useRef(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      onEnter: () => {
        if (triggered.current) return
        triggered.current = true
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          setValue(Math.floor(progress * target))
          if (progress < 1) requestAnimationFrame(tick)
        }
        tick()
      },
    })
  }, [target, duration])

  return { ref, value }
}

export function EcoSection() {
  const linesRef = useRef<HTMLParagraphElement[]>([])
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER ?? ''

  const [counterData, setCounterData] = useState({ fabricRescuedKg: 0, bagsCollectedPcs: 0 })
  const { ref: fabricRef, value: fabricValue } = useCountUp(counterData.fabricRescuedKg)
  const { ref: bagsRef, value: bagsValue } = useCountUp(counterData.bagsCollectedPcs)

  useEffect(() => {
    fetch('/api/eco-counter')
      .then(r => r.json())
      .then(d => setCounterData({ fabricRescuedKg: Number(d.fabricRescuedKg), bagsCollectedPcs: d.bagsCollectedPcs }))
      .catch(() => {})
  }, [])

  useEffect(() => {
    linesRef.current.forEach((el, i) => {
      if (!el) return
      gsap.fromTo(el,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.5, delay: i * 0.3,
          scrollTrigger: { trigger: el, start: 'top 80%' },
        }
      )
    })
  }, [])

  const lines = [
    { text: 'Spunbond adalah pilihan yang lebih baik.', color: 'white' },
    { text: 'Dan kami percaya,', color: 'white' },
    { text: 'pilihan yang lebih baik layak dijaga lebih lama.', color: 'white' },
    { text: "We don't say goodbye to spunbond.", color: '#E8470A' },
    { text: 'We give it another life.', color: '#E8470A' },
  ]

  return (
    <section id="eco" className="py-24 px-6" style={{ background: '#0D1F00' }}>
      <div className="max-w-5xl mx-auto">
        {/* Opening statement */}
        <div className="mb-20 max-w-2xl">
          {lines.map((line, i) => (
            <p
              key={i}
              ref={(el) => { if (el) linesRef.current[i] = el }}
              className="font-montserrat font-semibold mb-2 opacity-0"
              style={{
                fontSize: 'clamp(18px, 2.5vw, 28px)',
                color: line.color,
                lineHeight: 1.5,
              }}
            >
              {line.text}
            </p>
          ))}
        </div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {[
            {
              q: 'Got a worn-out bag?',
              desc: 'Kirimkan tas spunbond lamamu kepada kami. Kami akan memberikan kehidupan baru untuknya — bukan membuangnya.',
            },
            {
              q: 'Got leftover fabric?',
              desc: 'Punya sisa kain spunbond dari produksi sebelumnya? Titipkan kepada kami. Setiap sentimeter persegi berarti.',
            },
          ].map((col, i) => (
            <div key={i} className="border border-gray-700 rounded-2xl p-8">
              <h3 className="font-montserrat font-bold text-white text-2xl mb-3">{col.q}</h3>
              <p className="font-inter text-gray-400 mb-6 leading-relaxed">{col.desc}</p>
              <a
                href={`https://wa.me/${waNumber}?text=Halo%20SBC.id%2C%20saya%20ingin%20${i === 0 ? 'menyerahkan%20tas%20lama' : 'menyerahkan%20sisa%20kain'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-montserrat font-semibold text-white rounded-full px-6 py-3 text-sm transition-transform hover:scale-105"
                style={{ background: '#E8470A' }}
              >
                Talk to us
              </a>
            </div>
          ))}
        </div>

        {/* Counters */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div ref={fabricRef} className="text-center">
            <div
              className="font-montserrat font-bold mb-1"
              style={{ fontSize: '48px', color: '#7AB611' }}
            >
              {fabricValue}
              <span className="text-2xl ml-1">kg</span>
            </div>
            <p className="font-inter text-sm text-gray-400">Fabric rescued</p>
          </div>
          <div ref={bagsRef} className="text-center">
            <div
              className="font-montserrat font-bold mb-1"
              style={{ fontSize: '48px', color: '#7AB611' }}
            >
              {bagsValue}
              <span className="text-2xl ml-1">pcs</span>
            </div>
            <p className="font-inter text-sm text-gray-400">Bags collected</p>
          </div>
        </div>

        <p
          className="font-inter text-center italic"
          style={{ color: '#6B7280', fontSize: '18px' }}
        >
          Because responsibility doesn't end at the point of sale.
        </p>
      </div>
    </section>
  )
}
