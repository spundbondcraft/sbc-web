'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const pillars = [
  { title: 'Ultra-flexible', sub: 'Tidak ada template. Setiap tas dirancang dari nol sesuai kebutuhan kamu.' },
  { title: 'Atelier-grade', sub: 'Standar produksi yang ketat. Setiap jahitan, setiap warna, setiap detail diperhatikan.' },
  { title: 'Eco circular', sub: 'Aval spunbond ditampung dan diolah kembali. Karena kita peduli setelah produksi selesai.' },
]

export function USPSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const pillarsRef = useRef<HTMLDivElement[]>([])
  const underlinesRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // Background transition on enter
    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(section, { backgroundColor: '#FFFFFF', duration: 0.5 })
      },
      onLeaveBack: () => {
        gsap.to(section, { backgroundColor: '#0D1F00', duration: 0.5 })
      },
    })

    // Title words
    if (titleRef.current) {
      const words = Array.from(titleRef.current.querySelectorAll('span'))
      gsap.fromTo(words,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: titleRef.current, start: 'top 75%' },
        }
      )
    }

    // Sub
    gsap.fromTo(subRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.5, delay: 0.8,
        scrollTrigger: { trigger: subRef.current, start: 'top 75%' },
      }
    )

    // Pillars
    pillarsRef.current.forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.5,
          delay: i * 0.4,
          scrollTrigger: { trigger: section, start: 'top 60%' },
        }
      )
    })

    // Underlines
    underlinesRef.current.forEach((el, i) => {
      gsap.fromTo(el,
        { scaleX: 0 },
        {
          scaleX: 1, duration: 0.4, ease: 'power2.out',
          delay: i * 0.4 + 0.2,
          scrollTrigger: { trigger: section, start: 'top 60%' },
        }
      )
    })

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-32 px-6"
      style={{ background: '#0D1F00', transition: 'background 0.5s' }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2
          ref={titleRef}
          className="font-montserrat font-bold mb-6"
          style={{ fontSize: 'clamp(36px, 5vw, 64px)', color: '#1A1A1A' }}
        >
          {'Every piece, purposefully made.'.split(' ').map((word, i) => (
            <span key={i} className="inline-block opacity-0 mr-[0.3em]">{word}</span>
          ))}
        </h2>

        <p
          ref={subRef}
          className="font-inter text-xl mb-20 opacity-0"
          style={{ color: '#6B7280' }}
        >
          Bukan sekadar produksi. Asesmen. Konfirmasi. Eksekusi.
        </p>

        <div className="grid md:grid-cols-3 gap-12">
          {pillars.map((p, i) => (
            <div
              key={i}
              ref={(el) => { if (el) pillarsRef.current[i] = el }}
              className="opacity-0 text-left"
            >
              <div className="relative inline-block mb-3">
                <h3 className="font-montserrat font-bold text-xl" style={{ color: '#1A1A1A' }}>
                  {p.title}
                </h3>
                <div
                  ref={(el) => { if (el) underlinesRef.current[i] = el }}
                  className="h-0.5 mt-1 origin-left"
                  style={{ background: '#E8470A', transform: 'scaleX(0)' }}
                />
              </div>
              <p className="font-inter text-sm" style={{ color: '#6B7280', lineHeight: '1.7' }}>
                {p.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
