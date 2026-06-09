'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'

gsap.registerPlugin(ScrollTrigger)

const FILTERS = ['All', 'Handle Jinjing', 'Box Bag', 'Bakery', 'Oval', 'Serut', 'Thermal']

interface PortfolioItem {
  id: string
  imageUrl: string
  blurDataUrl?: string
  bagModel: string
  sablonType?: string
  color?: string
}

export function PortfolioSection() {
  const [filter, setFilter] = useState('All')
  const [items, setItems] = useState<PortfolioItem[]>([])
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/portfolio?visible=true&limit=8')
      .then(r => r.json())
      .then(d => setItems(d.items ?? []))
      .catch(() => {})
  }, [])

  const filtered = filter === 'All' ? items : items.filter(i =>
    i.bagModel.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      className="py-24 overflow-hidden"
      style={{ background: '#0D1F00' }}
    >
      <div className="px-6 max-w-7xl mx-auto mb-12">
        <h2
          className="font-montserrat font-bold text-white mb-3"
          style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}
        >
          Our Work
        </h2>
        <p className="font-inter text-gray-400 mb-8">
          Every bag tells a story. Here are some of theirs.
        </p>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="font-inter text-sm rounded-full px-4 py-1.5 transition-all duration-200"
              style={{
                background: filter === f ? '#E8470A' : 'transparent',
                color: filter === f ? '#fff' : '#9CA3AF',
                border: `1px solid ${filter === f ? '#E8470A' : '#374151'}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl animate-pulse" style={{ background: '#1a3300' }} />
            ))}
          </div>
        </div>
      ) : (
        <div
          ref={trackRef}
          className="flex gap-4 px-6 md:px-12"
          style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
        >
          {filtered.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      ref={cardRef}
      data-portfolio-img
      className="relative flex-shrink-0 rounded-xl overflow-hidden cursor-pointer"
      style={{ width: 'clamp(220px, 30vw, 320px)', aspectRatio: '3/4' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="absolute inset-0 bg-gray-800 animate-pulse"
        style={{ zIndex: 0 }}
      />
      {item.imageUrl && (
        <Image
          src={item.imageUrl}
          alt={item.bagModel}
          fill
          className="object-cover"
          placeholder={item.blurDataUrl ? 'blur' : 'empty'}
          blurDataURL={item.blurDataUrl}
        />
      )}

      {/* Tag */}
      <div
        className="absolute top-3 right-3 font-inter text-white text-xs uppercase px-2 py-1 rounded"
        style={{ background: '#E8470A', fontSize: '11px', letterSpacing: '0.05em', zIndex: 2 }}
      >
        {item.bagModel}
      </div>

      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-4 transition-opacity duration-300"
        style={{
          background: 'rgba(13,31,0,0.85)',
          opacity: hovered ? 1 : 0,
          zIndex: 3,
        }}
      >
        <p className="font-montserrat font-bold text-white text-sm mb-1">{item.bagModel}</p>
        {item.sablonType && (
          <p className="font-inter text-xs" style={{ color: '#9CA3AF' }}>Sablon: {item.sablonType}</p>
        )}
        {item.color && (
          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-4 h-4 rounded-full border border-white/20"
              style={{ background: item.color }}
            />
            <span className="font-inter text-xs text-gray-400">{item.color}</span>
          </div>
        )}
      </div>
    </div>
  )
}
