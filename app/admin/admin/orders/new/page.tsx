'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { generateOrderCode, generateOrderId } from '@/lib/utils/orderCode'
import { calculateCogs } from '@/lib/utils/cogsCalc'
import { formatRupiah } from '@/lib/utils/formatRupiah'
import { Save, Calculator, Eye, AlertCircle } from 'lucide-react'
import type { CogsConfig } from '@/lib/db/schema'

const schema = z.object({
  codeInput: z.string().optional(),
  clientName: z.string().min(1, 'Nama wajib diisi'),
  companyName: z.string().optional(),
  whatsapp: z.string().min(8, 'WA tidak valid'),
  address: z.string().optional(),
  bagModel: z.string().min(1, 'Model wajib dipilih'),
  bagColor: z.string().optional(),
  bagGsm: z.coerce.number().optional(),
  surfaceArea: z.coerce.number().optional(),
  qty: z.coerce.number().min(1, 'Qty minimal 1'),
  sablonType: z.string().optional(),
  sablonWidth: z.coerce.number().optional(),
  sablonHeight: z.coerce.number().optional(),
  rubberBinder: z.coerce.number().optional(),
  rubberRubber: z.coerce.number().optional(),
  rubberPigment: z.coerce.number().optional(),
  handleType: z.string().optional(),
  velcro: z.boolean().optional(),
  velcroCm: z.coerce.number().optional(),
  resleting: z.boolean().optional(),
  resletingQty: z.coerce.number().optional(),
  mika: z.boolean().optional(),
  mikaWidth: z.coerce.number().optional(),
  mikaHeight: z.coerce.number().optional(),
  banner: z.boolean().optional(),
  bannerWidth: z.coerce.number().optional(),
  bannerHeight: z.coerce.number().optional(),
  seamsPerimeter: z.coerce.number().optional(),
  seamsLanes: z.coerce.number().optional(),
  bagWidth: z.coerce.number().optional(),
  thermalCm: z.coerce.number().optional(),
  estimatedDone: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  sellingPrice: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const BAG_MODELS = ['Handle Jinjing', 'Box Bag', 'Bakery Bag', 'Oval Bag', 'Tas Serut', 'Thermal Bag', 'Custom']
const HANDLE_TYPES = ['Tali Webbing', 'Tali Spunbond', 'Jahit Langsung', 'Tidak Ada']

const inputCls = "w-full font-inter text-sm rounded-lg px-3 py-2.5 outline-none transition-colors"
const inputSt = { background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }

function Field({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block font-inter text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#6B7280' }}>
        {label}{required && <span style={{ color: '#E8470A' }}> *</span>}
      </label>
      {children}
      {error && <p className="font-inter text-xs mt-1" style={{ color: '#EF4444' }}>{error}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
      <h2 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A1A' }}>{title}</h2>
      {children}
    </div>
  )
}

export default function NewOrderPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [cogsConfig, setCogsConfig] = useState<CogsConfig | null>(null)
  const [cogsResult, setCogsResult] = useState<ReturnType<typeof calculateCogs> | null>(null)
  const [sellingOverride, setSellingOverride] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { qty: 100, bagGsm: 75, seamsPerimeter: 100, seamsLanes: 2 },
  })

  const watchedValues = watch()
  const qty = watch('qty') ?? 100
  const bagModel = watch('bagModel') ?? ''
  const sablonType = watch('sablonType') ?? 'Tidak Ada'
  const velcro = watch('velcro')
  const resleting = watch('resleting')
  const mika = watch('mika')
  const banner = watch('banner')
  const codeInput = watch('codeInput') ?? ''

  const previewCode = generateOrderCode(codeInput, 'pra')

  useEffect(() => {
    fetch('/api/cogs')
      .then(r => r.json())
      .then(d => setCogsConfig(d))
      .catch(() => {})
  }, [])

  const hitungCogs = () => {
    if (!cogsConfig) return alert('Config COGS belum tersedia')
    const v = watchedValues
    if (!v.surfaceArea || !v.qty) return alert('Isi luas permukaan dan qty dulu')

    const result = calculateCogs({
      surfaceArea: Number(v.surfaceArea),
      qty: Number(v.qty),
      seamsPerimeter: Number(v.seamsPerimeter ?? 100),
      seamsLanes: Number(v.seamsLanes ?? 2),
      sablonType: (v.sablonType === 'DTF' ? 'dtf' : v.sablonType === 'Rubber' ? 'rubber' : 'none'),
      sablonWidth: Number(v.sablonWidth ?? 0),
      sablonHeight: Number(v.sablonHeight ?? 0),
      rubberBinderGram: Number(v.rubberBinder ?? 0),
      rubberRubberGram: Number(v.rubberRubber ?? 0),
      rubberPigmentGram: Number(v.rubberPigment ?? 0),
      velcro: v.velcro,
      velcroCm: Number(v.velcroCm ?? 0),
      resleting: v.resleting,
      resletingQty: Number(v.resletingQty ?? 0),
      mika: v.mika,
      mikaWidth: Number(v.mikaWidth ?? 0),
      mikaHeight: Number(v.mikaHeight ?? 0),
      banner: v.banner,
      bannerWidth: Number(v.bannerWidth ?? 0),
      bannerHeight: Number(v.bannerHeight ?? 0),
      bagModel: v.bagModel ?? '',
      bagWidth: Number(v.bagWidth ?? 0),
      thermalCm: Number(v.thermalCm ?? 0),
      includeGasoline: true,
      includeElectricity: true,
    }, cogsConfig)

    setCogsResult(result)
    setSellingOverride(String(Math.ceil(result.hargaJual)))
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    const codePra = generateOrderCode(data.codeInput ?? '', 'pra')

    const payload = {
      id: generateOrderId(),
      codePra,
      clientName: data.clientName,
      companyName: data.companyName,
      whatsapp: data.whatsapp,
      address: data.address,
      bagModel: data.bagModel,
      bagColor: data.bagColor,
      bagGsm: data.bagGsm,
      surfaceArea: data.surfaceArea,
      qty: data.qty,
      sablonType: data.sablonType,
      sablonWidth: data.sablonWidth,
      sablonHeight: data.sablonHeight,
      handleType: data.handleType,
      notes: data.notes,
      internalNotes: data.internalNotes,
      cogsTotal: cogsResult?.cogsFinal ?? null,
      cogsBreakdown: cogsResult ?? null,
      sellingPrice: sellingOverride ? parseFloat(sellingOverride.replace(/[^0-9]/g, '')) : (cogsResult?.hargaJual ?? null),
      phase: 'pra',
      productionStatus: 'received',
      payments: [],
      estimatedDone: data.estimatedDone ? new Date(data.estimatedDone) : null,
      additionalOptions: {
        velcro: data.velcro, velcroCm: data.velcroCm,
        resleting: data.resleting, resletingQty: data.resletingQty,
        mika: data.mika, mikaWidth: data.mikaWidth, mikaHeight: data.mikaHeight,
        banner: data.banner, bannerWidth: data.bannerWidth, bannerHeight: data.bannerHeight,
      },
    }

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const created = await res.json()
      router.push(`/admin/orders/${created.id}`)
    } else {
      const err = await res.json()
      alert(err.error ?? 'Gagal menyimpan order')
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-montserrat font-bold text-2xl" style={{ color: '#1A1A1A' }}>Order Baru</h1>
        <p className="font-inter text-sm mt-1" style={{ color: '#9CA3AF' }}>
          Fase PRA — sebelum konfirmasi final
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* Section 1: Kode Order */}
        <Section title="Section 1 — Kode Order">
          <Field label="Nomor urut (opsional)">
            <input
              {...register('codeInput')}
              placeholder="Isi angka atau kosongkan untuk auto"
              className={inputCls} style={inputSt}
            />
          </Field>
          <div
            className="mt-2 rounded-lg px-3 py-2 font-inter text-sm"
            style={{ background: 'rgba(232,71,10,0.08)', color: '#E8470A' }}
          >
            Preview: <strong>{previewCode}</strong> → <strong>{previewCode.replace('-PRA', '')}</strong>
          </div>
        </Section>

        {/* Section 2: Identitas Client */}
        <Section title="Section 2 — Identitas Client">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nama Client" required error={errors.clientName?.message}>
              <input {...register('clientName')} className={inputCls} style={inputSt} />
            </Field>
            <Field label="Nama Usaha / Event">
              <input {...register('companyName')} className={inputCls} style={inputSt} />
            </Field>
            <Field label="No. WhatsApp" required error={errors.whatsapp?.message}>
              <input {...register('whatsapp')} placeholder="08xxx" className={inputCls} style={inputSt} />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Alamat">
              <textarea {...register('address')} rows={2} className={inputCls} style={inputSt} />
            </Field>
          </div>
        </Section>

        {/* Section 3: Spesifikasi Tas */}
        <Section title="Section 3 — Spesifikasi Tas">
          {qty < 50 && (
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2 mb-3 font-inter text-xs"
              style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}
            >
              <AlertCircle size={14} />
              Qty &lt; 50 — Sablon otomatis DTF
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Model Tas" required error={errors.bagModel?.message}>
              <select {...register('bagModel')} className={inputCls} style={inputSt}>
                <option value="">Pilih model...</option>
                {BAG_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Warna Kain">
              <input {...register('bagColor')} placeholder="Natural, Hijau, dll" className={inputCls} style={inputSt} />
            </Field>
            <Field label="GSM">
              <input {...register('bagGsm')} type="number" className={inputCls} style={inputSt} />
            </Field>
            <Field label="Luas Permukaan (cm²)" required>
              <input {...register('surfaceArea')} type="number" className={inputCls} style={inputSt} />
            </Field>
            <Field label="Qty (pcs)" required error={errors.qty?.message}>
              <input {...register('qty')} type="number" className={inputCls} style={inputSt} />
            </Field>
            <Field label="Tali / Handle">
              <select {...register('handleType')} className={inputCls} style={inputSt}>
                <option value="">Pilih...</option>
                {HANDLE_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </Field>
          </div>

          {/* Model spesifik */}
          {bagModel === 'Tas Serut' && (
            <div className="mt-3">
              <Field label="Lebar Tas (cm) — untuk hitung tali serut">
                <input {...register('bagWidth')} type="number" className={inputCls} style={inputSt} />
              </Field>
            </div>
          )}
          {bagModel === 'Thermal Bag' && (
            <div className="mt-3">
              <Field label="Kebutuhan Aluminium Foil (cm)">
                <input {...register('thermalCm')} type="number" className={inputCls} style={inputSt} />
              </Field>
            </div>
          )}
        </Section>

        {/* Section 4: Customization */}
        <Section title="Section 4 — Customization">
          {/* Sablon */}
          <p className="font-inter text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: '#6B7280' }}>
            Sablon
          </p>
          <div className="flex gap-3 mb-4">
            {['DTF', 'Rubber', 'Tidak Ada'].map(s => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={s}
                  {...register('sablonType')}
                  disabled={s === 'Rubber' && qty < 50}
                  defaultChecked={s === 'Tidak Ada'}
                />
                <span
                  className="font-inter text-sm"
                  style={{ color: s === 'Rubber' && qty < 50 ? '#9CA3AF' : '#374151' }}
                >
                  {s}{s === 'Rubber' && qty < 50 ? ' (min. 50 pcs)' : ''}
                </span>
              </label>
            ))}
          </div>

          {sablonType === 'DTF' && (
            <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-lg" style={{ background: '#F9FAF6' }}>
              <Field label="Lebar Desain (cm)">
                <input {...register('sablonWidth')} type="number" className={inputCls} style={inputSt} />
              </Field>
              <Field label="Tinggi Desain (cm)">
                <input {...register('sablonHeight')} type="number" className={inputCls} style={inputSt} />
              </Field>
            </div>
          )}

          {sablonType === 'Rubber' && qty >= 50 && (
            <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-lg" style={{ background: '#F9FAF6' }}>
              <Field label="Binder (gram)">
                <input {...register('rubberBinder')} type="number" className={inputCls} style={inputSt} />
              </Field>
              <Field label="Rubber (gram)">
                <input {...register('rubberRubber')} type="number" className={inputCls} style={inputSt} />
              </Field>
              <Field label="Pigmen (gram)">
                <input {...register('rubberPigment')} type="number" className={inputCls} style={inputSt} />
              </Field>
              <Field label="Lebar Desain (cm)">
                <input {...register('sablonWidth')} type="number" className={inputCls} style={inputSt} />
              </Field>
              <Field label="Tinggi Desain (cm)">
                <input {...register('sablonHeight')} type="number" className={inputCls} style={inputSt} />
              </Field>
            </div>
          )}

          {/* Additional options */}
          <p className="font-inter text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: '#6B7280' }}>
            Additional Options
          </p>
          <div className="flex flex-col gap-3">
            {/* Velcro */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-1">
                <input type="checkbox" {...register('velcro')} />
                <span className="font-inter text-sm" style={{ color: '#374151' }}>Velcro</span>
              </label>
              {velcro && (
                <Field label="Panjang Velcro (cm)">
                  <input {...register('velcroCm')} type="number" className={inputCls} style={inputSt} />
                </Field>
              )}
            </div>

            {/* Resleting */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-1">
                <input type="checkbox" {...register('resleting')} />
                <span className="font-inter text-sm" style={{ color: '#374151' }}>Resleting</span>
              </label>
              {resleting && (
                <Field label="Jumlah Resleting (pcs)">
                  <input {...register('resletingQty')} type="number" className={inputCls} style={inputSt} />
                </Field>
              )}
            </div>

            {/* Mika */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-1">
                <input type="checkbox" {...register('mika')} />
                <span className="font-inter text-sm" style={{ color: '#374151' }}>Mika</span>
              </label>
              {mika && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Lebar Mika (cm)">
                    <input {...register('mikaWidth')} type="number" className={inputCls} style={inputSt} />
                  </Field>
                  <Field label="Tinggi Mika (cm)">
                    <input {...register('mikaHeight')} type="number" className={inputCls} style={inputSt} />
                  </Field>
                </div>
              )}
            </div>

            {/* Banner */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-1">
                <input type="checkbox" {...register('banner')} />
                <span className="font-inter text-sm" style={{ color: '#374151' }}>Banner</span>
              </label>
              {banner && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Lebar Banner (cm)">
                    <input {...register('bannerWidth')} type="number" className={inputCls} style={inputSt} />
                  </Field>
                  <Field label="Tinggi Banner (cm)">
                    <input {...register('bannerHeight')} type="number" className={inputCls} style={inputSt} />
                  </Field>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* Section 5: Produksi */}
        <Section title="Section 5 — Produksi & Catatan">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field label="Estimasi Selesai">
              <input {...register('estimatedDone')} type="date" className={inputCls} style={inputSt} />
            </Field>
          </div>
          <div className="mb-3">
            <Field label="Catatan untuk Client">
              <textarea {...register('notes')} rows={2} className={inputCls} style={inputSt} />
            </Field>
          </div>
          <div>
            <label
              className="block font-inter text-xs font-semibold mb-1.5 uppercase tracking-wide"
              style={{ color: '#E8470A' }}
            >
              Catatan Internal
              <span
                className="ml-2 font-inter text-xs px-2 py-0.5 rounded normal-case"
                style={{ background: '#FEE2E2', color: '#991B1B' }}
              >
                Tidak tampil ke client
              </span>
            </label>
            <textarea {...register('internalNotes')} rows={2} className={inputCls} style={inputSt} />
          </div>
        </Section>

        {/* Section 6: Harga */}
        <Section title="Section 6 — Harga">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Field label="Keliling Jahitan (cm)">
              <input {...register('seamsPerimeter')} type="number" className={inputCls} style={inputSt} />
            </Field>
            <Field label="Jumlah Jalur Jahitan">
              <input {...register('seamsLanes')} type="number" className={inputCls} style={inputSt} />
            </Field>
          </div>

          <button
            type="button"
            onClick={hitungCogs}
            className="flex items-center gap-2 font-montserrat font-semibold text-sm text-white rounded-lg px-4 py-2.5 mb-4 transition-transform hover:scale-[1.02]"
            style={{ background: '#5A8A0A' }}
          >
            <Calculator size={16} /> Hitung COGS
          </button>

          {cogsResult && (
            <div className="rounded-lg p-4 mb-4" style={{ background: '#F0F9E0', border: '1px solid rgba(90,138,10,0.2)' }}>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  ['COGS Final /pcs', formatRupiah(cogsResult.cogsFinal)],
                  ['Keuntungan /pcs', formatRupiah(cogsResult.keuntungan)],
                  ['Margin', `${cogsResult.marginPercent.toFixed(1)}%`],
                  ['Total Qty', formatRupiah(cogsResult.totalQty)],
                ].map(([l, v]) => (
                  <div key={l}>
                    <p className="font-inter text-xs" style={{ color: '#6B7280' }}>{l}</p>
                    <p className="font-inter text-sm font-semibold" style={{ color: '#374151' }}>{v}</p>
                  </div>
                ))}
              </div>

              <Field label="Harga Jual (editable)">
                <input
                  value={sellingOverride}
                  onChange={e => setSellingOverride(e.target.value)}
                  className={inputCls}
                  style={{ ...inputSt, fontWeight: 600, color: '#5A8A0A' }}
                />
              </Field>
            </div>
          )}
        </Section>

        {/* Tombol aksi */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 font-montserrat font-semibold text-sm rounded-xl px-5 py-3 transition-opacity"
            style={{ border: '1px solid #E5E7EB', color: '#374151', background: '#fff' }}
          >
            <Eye size={16} /> Preview
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 font-montserrat font-semibold text-sm text-white rounded-xl py-3 transition-opacity disabled:opacity-50"
            style={{ background: '#E8470A' }}
          >
            {saving
              ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              : <><Save size={16} /> Simpan & Generate Kode</>}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowPreview(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
            style={{ background: '#fff' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="font-montserrat font-bold text-lg mb-4" style={{ color: '#1A1A1A' }}>
              Review Order
            </h2>
            <div className="space-y-3">
              {[
                ['Kode PRA', previewCode],
                ['Kode Fixed', previewCode.replace('-PRA', '')],
                ['Client', watchedValues.clientName],
                ['WA', watchedValues.whatsapp],
                ['Model', watchedValues.bagModel],
                ['Qty', `${watchedValues.qty} pcs`],
                ['Sablon', watchedValues.sablonType ?? '-'],
                ['Estimasi', watchedValues.estimatedDone ?? '-'],
                ['Harga Jual', sellingOverride ? formatRupiah(parseFloat(sellingOverride.replace(/[^0-9]/g, ''))) : '-'],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between py-2" style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <span className="font-inter text-sm" style={{ color: '#9CA3AF' }}>{l}</span>
                  <span className="font-inter text-sm font-semibold" style={{ color: '#374151' }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 font-inter text-sm rounded-lg py-2.5"
                style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}
              >
                Edit
              </button>
              <button
                onClick={() => { setShowPreview(false); handleSubmit(onSubmit)() }}
                className="flex-1 font-montserrat font-semibold text-sm text-white rounded-lg py-2.5"
                style={{ background: '#E8470A' }}
              >
                Simpan & Generate Kode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
