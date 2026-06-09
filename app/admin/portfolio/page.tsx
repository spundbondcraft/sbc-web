'use client'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Plus, Eye, EyeOff, Trash2, Upload } from 'lucide-react'
import type { Portfolio } from '@/lib/db/schema'

const BAG_MODELS = ['Handle Jinjing', 'Box Bag', 'Bakery Bag', 'Oval Bag', 'Tas Serut', 'Thermal Bag', 'Custom']
const SABLON_TYPES = ['Rubber', 'DTF', 'Tidak Ada']

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Form
  const [bagModel, setBagModel] = useState(BAG_MODELS[0])
  const [sablonType, setSablonType] = useState('')
  const [color, setColor] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [fileBase64, setFileBase64] = useState<string | null>(null)

  const fetch_ = () => {
    fetch('/api/portfolio?limit=100')
      .then(r => r.json())
      .then(d => { setItems(d.items ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetch_() }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setPreview(result)
      setFileBase64(result)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!fileBase64) return
    setUploading(true)
    await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: fileBase64, bagModel, sablonType, color }),
    })
    setShowForm(false)
    setPreview(null)
    setFileBase64(null)
    setColor('')
    fetch_()
    setUploading(false)
  }

  const toggleVisibility = async (id: string) => {
    await fetch('/api/portfolio', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', id }),
    })
    fetch_()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-montserrat font-bold text-2xl" style={{ color: '#1A1A1A' }}>Portfolio</h1>
          <p className="font-inter text-sm mt-1" style={{ color: '#9CA3AF' }}>{items.length} foto</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 font-montserrat font-semibold text-sm text-white rounded-xl px-4 py-2.5"
          style={{ background: '#E8470A' }}
        >
          <Plus size={16} /> Upload Foto
        </button>
      </div>

      {/* Upload form */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#fff' }}>
            <h2 className="font-montserrat font-bold text-lg mb-4" style={{ color: '#1A1A1A' }}>Upload Foto Portfolio</h2>

            {/* Dropzone */}
            <div
              className="border-2 border-dashed rounded-xl p-8 text-center mb-4 cursor-pointer hover:border-sbc-orange transition-colors"
              style={{ borderColor: preview ? '#E8470A' : '#E5E7EB' }}
              onClick={() => fileRef.current?.click()}
            >
              {preview ? (
                <div className="relative h-48 rounded-lg overflow-hidden">
                  <Image src={preview} alt="preview" fill className="object-cover" />
                </div>
              ) : (
                <div>
                  <Upload size={32} className="mx-auto mb-2" style={{ color: '#9CA3AF' }} />
                  <p className="font-inter text-sm" style={{ color: '#9CA3AF' }}>Klik untuk pilih foto</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="font-inter text-xs mb-1" style={{ color: '#9CA3AF' }}>Model Tas</p>
                <select value={bagModel} onChange={e => setBagModel(e.target.value)}
                  className="w-full font-inter text-sm rounded-lg px-3 py-2.5 outline-none"
                  style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }}>
                  {BAG_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <p className="font-inter text-xs mb-1" style={{ color: '#9CA3AF' }}>Sablon</p>
                <select value={sablonType} onChange={e => setSablonType(e.target.value)}
                  className="w-full font-inter text-sm rounded-lg px-3 py-2.5 outline-none"
                  style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }}>
                  <option value="">Pilih...</option>
                  {SABLON_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <p className="font-inter text-xs mb-1" style={{ color: '#9CA3AF' }}>Warna (hex atau nama)</p>
                <input value={color} onChange={e => setColor(e.target.value)} placeholder="#7AB611 atau Hijau"
                  className="w-full font-inter text-sm rounded-lg px-3 py-2.5 outline-none"
                  style={{ background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }} />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 font-inter text-sm rounded-lg py-2.5" style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}>
                Batal
              </button>
              <button
                onClick={handleUpload}
                disabled={!fileBase64 || uploading}
                className="flex-1 font-montserrat font-semibold text-sm text-white rounded-lg py-2.5 disabled:opacity-40"
                style={{ background: '#E8470A' }}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl animate-pulse" style={{ background: '#F3F4F6' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map(item => (
            <div
              key={item.id}
              className="relative rounded-xl overflow-hidden group"
              style={{ aspectRatio: '3/4', opacity: item.isVisible ? 1 : 0.5 }}
            >
              <Image
                src={item.imageUrl}
                alt={item.bagModel}
                fill
                className="object-cover"
                placeholder={item.blurDataUrl ? 'blur' : 'empty'}
                blurDataURL={item.blurDataUrl ?? undefined}
              />

              {/* Overlay on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3"
                style={{ background: 'rgba(13,31,0,0.8)' }}
              >
                <div className="flex justify-end">
                  <button
                    onClick={() => toggleVisibility(item.id)}
                    className="p-1.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                    title={item.isVisible ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {item.isVisible
                      ? <Eye size={14} style={{ color: '#7AB611' }} />
                      : <EyeOff size={14} style={{ color: '#9CA3AF' }} />}
                  </button>
                </div>
                <div>
                  <p className="font-montserrat font-semibold text-white text-xs">{item.bagModel}</p>
                  {item.sablonType && (
                    <p className="font-inter text-xs" style={{ color: '#9CA3AF' }}>{item.sablonType}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
