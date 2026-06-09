'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MessageSquare, Search, Eye, CheckCircle, Hammer, Package } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  { en: 'DISCUSS', id: 'Ceritakan idemu. Tidak ada ide yang terlalu spesifik.', Icon: MessageSquare },
  { en: 'ASSESS', id: 'Kami pelajari kebutuhanmu — material, fungsi, estetika.', Icon: Search },
  { en: 'VISUALIZE', id: 'Mockup dikirim sebelum produksi dimulai.', Icon: Eye },
  { en: 'CONFIRM', id: 'Tidak ada yang berjalan tanpa persetujuanmu.', Icon: CheckCircle },
  { en: 'CRAFT', id: 'Produksi berjalan dengan standar atelier.', Icon: Hammer },
  { en: 'DELIVER', id: 'Sampai ke tanganmu — tepat seperti yang dibayangkan.', Icon: Package },
]

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const stepsRef = useRef<HTMLDivElement[]>([])
  const progressRef = useRef<HTMLDivElement>(null)
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER ?? ''

  useEffect(() => {
    stepsRef.current.forEach((el) => {
      if (!el) return
      const label = el.querySelector('.step-label')
      const desc = el.querySelector('.step-desc')
      const icon = el.querySelector('.step-icon')

      gsap.fromTo(label,
        { x: -40, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.5, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 75%' },
        }
      )
      gsap.fromTo(desc,
        { opacity: 0 },
        {
          opacity: 1, duration: 0.4, delay: 0.2,
          scrollTrigger: { trigger: el, start: 'top 75%' },
        }
      )
      gsap.fromTo(icon,
        { scale: 0 },
        {
          scale: 1, duration: 0.4, delay: 0.3, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: el, start: 'top 75%' },
        }
      )
    })
  }, [])

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-24 px-6 bg-white"
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-[240px_1fr] gap-16">
          {/* Sticky left timeline */}
          <div className="hidden md:block relative">
            <div className="sticky top-32">
              <h2
                className="font-montserrat font-bold mb-2"
                style={{ fontSize: 'clamp(28px,3vw,40px)', color: '#1A1A1A' }}
              >
                How it works
              </h2>
              <p className="font-inter text-sm" style={{ color: '#9CA3AF' }}>
                6 steps to your perfect bag
              </p>
              {/* Progress line */}
              <div className="mt-8 relative h-48">
                <div className="absolute left-0 top-0 w-0.5 h-full" style={{ background: '#E5E7EB' }} />
                <div ref={progressRef} className="absolute left-0 top-0 w-0.5 h-0" style={{ background: '#E8470A', transition: 'height 0.3s' }} />
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-16">
            {steps.map((step, i) => (
              <div
                key={i}
                ref={(el) => { if (el) stepsRef.current[i] = el }}
                className="flex gap-6"
              >
                <div
                  className="step-icon flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: '#FEF2EB', color: '#E8470A' }}
                >
                  <step.Icon size={20} />
                </div>
                <div>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span
                      className="step-label font-montserrat font-bold"
                      style={{ fontSize: 'clamp(24px, 3vw, 32px)', color: '#1A1A1A', opacity: 0 }}
                    >
                      {step.en}
                    </span>
                    <span className="font-inter text-xs font-semibold" style={{ color: '#E8470A', letterSpacing: '0.1em' }}>
                      0{i + 1}
                    </span>
                  </div>
                  <p
                    className="step-desc font-inter"
                    style={{ fontSize: '18px', color: '#6B7280', lineHeight: '1.7', opacity: 0 }}
                  >
                    {step.id}
                  </p>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <p className="font-montserrat font-semibold text-xl mb-4" style={{ color: '#1A1A1A' }}>
                Ready to start? Let's discuss.
              </p>
              <a
                href={`https://wa.me/${waNumber}?text=Halo%20SBC.id%2C%20saya%20ingin%20mulai%20diskusi`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-montserrat font-semibold text-white rounded-full px-8 py-4 transition-transform hover:scale-105"
                style={{ background: '#E8470A', fontSize: '16px' }}
              >
                Chat via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
