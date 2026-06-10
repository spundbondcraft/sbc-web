'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { generateOrderCode, generateOrderId } from '@/lib/utils/orderCode'
import { Save, ChevronDown } from 'lucide-react'

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
  handleType: z.string().optional(),
  notes: z.string().optional(),
  estimatedDone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const BAG_MODELS = ['Handle Jinjing', 'Box Bag', 'Bakery Bag', 'Oval Bag', 'Tas Serut', 'Thermal Bag', 'Custom']
const SABLON_TYPES = ['Rubber', 'DTF', 'Tidak Ada']
const HANDLE_TYPES = ['Tali Webbing', 'Tali Spunbond', 'Jahit Langsung', 'Tidak Ada']

const InputField = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="block font-inter text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#6B7280' }}>
      {label}
    </label>
    {children}
    {error && <p className="font-inter text-xs mt-1" style={{ color: '#EF4444' }}>{error}</p>}
  </div>
)

const inputClass = "w-full font-inter text-sm rounded-lg px-3 py-2.5 outline-none transition-colors"
const inputStyle = { background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }

export default function NewOrderPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState('')

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { qty: 100, bagGsm: 75 },
  })

  const codeInput = watch('codeInput')
  const previewCode = generateOrderCode(codeInput ?? '', 'pra')

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    const codePra = generateOrderCode(data.codeInput ?? '', 'pra')

    const payload = {
      ...data,
      codePra,
      id: generateOrderId(),
      phase: 'pra',
      productionStatus: 'received',
      payments: [],
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
        <p className="font-inter text-sm mt-1" style={{ color: '#9CA3AF' }}>Fase PRA — sebelum konfirmasi final</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Kode */}
        <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
          <h2 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A1A' }}>
            Kode Order
          </h2>
          <InputField label="Nomor urut (opsional)">
            <input
              {...register('codeInput')}
              placeholder="001 — kosongkan untuk auto"
              className={inputClass}
              style={inputStyle}
            />
          </InputField>
          <div
            className="mt-2 rounded-lg px-3 py-2 font-montserrat font-bold text-sm"
            style={{ background: 'rgba(232,71,10,0.08)', color: '#E8470A' }}
          >
            Preview: {previewCode}
          </div>
        </div>

        {/* Identitas klien */}
        <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
          <h2 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A1A' }}>
            Identitas Klien
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Nama Klien *" error={errors.clientName?.message}>
              <input {...register('clientName')} className={inputClass} style={inputStyle} />
            </InputField>
            <InputField label="Nama Perusahaan">
              <input {...register('companyName')} className={inputClass} style={inputStyle} />
            </InputField>
            <InputField label="WhatsApp *" error={errors.whatsapp?.message}>
              <input {...register('whatsapp')} placeholder="08xxx" className={inputClass} style={inputStyle} />
            </InputField>
          </div>
          <div className="mt-4">
            <InputField label="Alamat">
              <textarea {...register('address')} rows={2} className={inputClass} style={inputStyle} />
            </InputField>
          </div>
        </div>

        {/* Spesifikasi tas */}
        <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
          <h2 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A1A' }}>
            Spesifikasi Tas
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Model Tas *" error={errors.bagModel?.message}>
              <select {...register('bagModel')} className={inputClass} style={inputStyle}>
                <option value="">Pilih model...</option>
                {BAG_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </InputField>
            <InputField label="Warna">
              <input {...register('bagColor')} placeholder="Natural, Hijau, dll" className={inputClass} style={inputStyle} />
            </InputField>
            <InputField label="GSM">
              <input {...register('bagGsm')} type="number" className={inputClass} style={inputStyle} />
            </InputField>
            <InputField label="Luas Permukaan (cm²)">
              <input {...register('surfaceArea')} type="number" className={inputClass} style={inputStyle} />
            </InputField>
            <InputField label="Qty (pcs) *" error={errors.qty?.message}>
              <input {...register('qty')} type="number" className={inputClass} style={inputStyle} />
            </InputField>
            <InputField label="Tipe Handle">
              <select {...register('handleType')} className={inputClass} style={inputStyle}>
                <option value="">Pilih...</option>
                {HANDLE_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </InputField>
          </div>
        </div>

        {/* Sablon */}
        <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
          <h2 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A1A' }}>
            Sablon
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Tipe Sablon">
              <select {...register('sablonType')} className={inputClass} style={inputStyle}>
                <option value="">Pilih...</option>
                {SABLON_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </InputField>
            <InputField label="Lebar (cm)">
              <input {...register('sablonWidth')} type="number" className={inputClass} style={inputStyle} />
            </InputField>
            <InputField label="Tinggi (cm)">
              <input {...register('sablonHeight')} type="number" className={inputClass} style={inputStyle} />
            </InputField>
          </div>
        </div>

        {/* Catatan */}
        <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
          <h2 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A1A' }}>
            Catatan & Timeline
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <InputField label="Catatan untuk Klien">
                <textarea {...register('notes')} rows={2} className={inputClass} style={inputStyle} />
              </InputField>
            </div>
            <InputField label="Estimasi Selesai">
              <input {...register('estimatedDone')} type="date" className={inputClass} style={inputStyle} />
            </InputField>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 font-montserrat font-semibold text-white rounded-xl py-3.5 transition-opacity disabled:opacity-50"
          style={{ background: '#E8470A' }}
        >
          {saving
            ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            : <><Save size={18} /> Simpan Order PRA</>}
        </button>
      </form>
    </div>
  )
}
