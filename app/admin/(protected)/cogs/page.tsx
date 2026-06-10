'use client'
import { useEffect, useState } from 'react'
import { calculateCogs, type CogsInput } from '@/lib/utils/cogsCalc'
import { formatRupiah } from '@/lib/utils/formatRupiah'
import { Save, Lock, Calculator } from 'lucide-react'
import type { CogsConfig } from '@/lib/db/schema'

type Tab = 'config' | 'calc'
const inputClass = "w-full font-inter text-sm rounded-lg px-3 py-2 outline-none"
const inputStyle = { background: '#F9FAF6', border: '1px solid #E5E7EB', color: '#1A1A1A' }

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
      <h3 className="font-montserrat font-semibold text-sm mb-4" style={{ color: '#1A1A1A' }}>{title}</h3>
      {children}
    </div>
  )
}

function PriceInput({ label, name, value, onChange }: {
  label: string; name: string; value: string | number; onChange: (n: string, v: string) => void
}) {
  return (
    <div>
      <p className="font-inter text-xs mb-1" style={{ color: '#9CA3AF' }}>{label}</p>
      <input
        type="number"
        step="any"
        value={value}
        onChange={e => onChange(name, e.target.value)}
        className={inputClass}
        style={inputStyle}
      />
    </div>
  )
}

export default function CogsPage() {
  const [tab, setTab] = useState<Tab>('config')
  const [config, setConfig] = useState<Partial<CogsConfig>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  // Calc state
  const [calcInput, setCalcInput] = useState<Partial<CogsInput>>({
    qty: 100,
    sablonType: 'none',
    seamsPerimeter: 100,
    seamsLanes: 2,
  })
  const [calcResult, setCalcResult] = useState<ReturnType<typeof calculateCogs> | null>(null)

  useEffect(() => {
    fetch('/api/cogs')
      .then(r => r.json())
      .then(data => { setConfig(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const updateConfig = (name: string, value: string) => {
    setConfig(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!unlocked) { setShowPass(true); return }
    setSaving(true)
    await fetch('/api/cogs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-config-password': password },
      body: JSON.stringify(config),
    })
    setSaving(false)
    alert('Config tersimpan!')
  }

  const handleCalc = () => {
    if (!calcInput.surfaceArea || !calcInput.qty) return
    const result = calculateCogs(calcInput as CogsInput, config as CogsConfig)
    setCalcResult(result)
  }

  const updateCalc = (name: string, value: any) => {
    setCalcInput(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-montserrat font-bold text-2xl" style={{ color: '#1A1A1A' }}>COGS</h1>
        <p className="font-inter text-sm mt-1" style={{ color: '#9CA3AF' }}>Konfigurasi biaya & kalkulator harga</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 rounded-xl p-1 w-fit" style={{ background: '#F3F4F6' }}>
        {(['config', 'calc'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="font-inter text-sm px-5 py-2 rounded-lg transition-all"
            style={{
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? '#1A1A1A' : '#9CA3AF',
              fontWeight: tab === t ? 600 : 400,
            }}
          >
            {t === 'config' ? 'Konfigurasi Harga' : 'Kalkulator Live'}
          </button>
        ))}
      </div>

      {tab === 'config' && !loading && (
        <div className="flex flex-col gap-4 max-w-2xl">
          <SectionCard title="Bahan Baku Utama">
            <div className="grid grid-cols-2 gap-3">
              <PriceInput label="Harga Kain /meter" name="fabricPricePerMeter" value={config.fabricPricePerMeter ?? ''} onChange={updateConfig} />
              <PriceInput label="Harga Benang /roll" name="threadPricePerRoll" value={config.threadPricePerRoll ?? ''} onChange={updateConfig} />
              <PriceInput label="Panjang Benang /roll (cm)" name="threadLengthPerRoll" value={config.threadLengthPerRoll ?? ''} onChange={updateConfig} />
            </div>
          </SectionCard>

          <SectionCard title="Aksesoris">
            <div className="grid grid-cols-2 gap-3">
              <PriceInput label="Harga Velcro /roll" name="velcroPricePerRoll" value={config.velcroPricePerRoll ?? ''} onChange={updateConfig} />
              <PriceInput label="Panjang Velcro /roll (cm)" name="velcroLengthPerRoll" value={config.velcroLengthPerRoll ?? ''} onChange={updateConfig} />
              <PriceInput label="Harga Resleting /pcs" name="zipperPricePerPcs" value={config.zipperPricePerPcs ?? ''} onChange={updateConfig} />
              <PriceInput label="Harga Tali /cm" name="ropePricePerCm" value={config.ropePricePerCm ?? ''} onChange={updateConfig} />
            </div>
          </SectionCard>

          <SectionCard title="Mika & Banner">
            <div className="grid grid-cols-2 gap-3">
              <PriceInput label="Harga Mika /cm²" name="mikaPricePerCm2" value={config.mikaPricePerCm2 ?? ''} onChange={updateConfig} />
              <PriceInput label="Extra jahit Mika" name="mikaExtraSewing" value={config.mikaExtraSewing ?? ''} onChange={updateConfig} />
              <PriceInput label="Harga Banner /cm²" name="bannerPricePerCm2" value={config.bannerPricePerCm2 ?? ''} onChange={updateConfig} />
              <PriceInput label="Extra jahit Banner" name="bannerExtraSewing" value={config.bannerExtraSewing ?? ''} onChange={updateConfig} />
            </div>
          </SectionCard>

          <SectionCard title="Sablon">
            <div className="grid grid-cols-2 gap-3">
              <PriceInput label="DTF /cm²" name="dtfPricePerCm2" value={config.dtfPricePerCm2 ?? ''} onChange={updateConfig} />
              <PriceInput label="Rubber Binder /gram" name="rubberBinderPerGram" value={config.rubberBinderPerGram ?? ''} onChange={updateConfig} />
              <PriceInput label="Rubber Rubber /gram" name="rubberRubberPerGram" value={config.rubberRubberPerGram ?? ''} onChange={updateConfig} />
              <PriceInput label="Rubber Pigment /gram" name="rubberPigmentPerGram" value={config.rubberPigmentPerGram ?? ''} onChange={updateConfig} />
              <PriceInput label="Rubber Labor" name="rubberLabor" value={config.rubberLabor ?? ''} onChange={updateConfig} />
              <PriceInput label="Rubber Film" name="rubberFilm" value={config.rubberFilm ?? ''} onChange={updateConfig} />
            </div>
          </SectionCard>

          <SectionCard title="Operasional & Margin">
            <div className="grid grid-cols-2 gap-3">
              <PriceInput label="BBM /order" name="gasolineCost" value={config.gasolineCost ?? ''} onChange={updateConfig} />
              <PriceInput label="Listrik /order" name="electricityCostPerOrder" value={config.electricityCostPerOrder ?? ''} onChange={updateConfig} />
              <PriceInput label="BTTK (%)" name="bttkPercent" value={config.bttkPercent ?? 20} onChange={updateConfig} />
              <PriceInput label="Penyusutan (%)" name="depreciationPercent" value={config.depreciationPercent ?? 2} onChange={updateConfig} />
              <PriceInput label="Margin (%)" name="marginPercent" value={config.marginPercent ?? 25} onChange={updateConfig} />
            </div>
          </SectionCard>

          {/* Lock notice */}
          {showPass && !unlocked && (
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: '#FEF2EB', border: '1px solid #E8470A33' }}>
              <Lock size={18} style={{ color: '#E8470A' }} />
              <div className="flex-1">
                <p className="font-inter text-sm mb-2" style={{ color: '#374151' }}>
                  Konfirmasi password untuk menyimpan config
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    className="flex-1 font-inter text-sm rounded-lg px-3 py-2 outline-none"
                    style={{ background: '#fff', border: '1px solid #E5E7EB' }}
                  />
                  <button
                    onClick={() => {
                      if (password === 'Thenewof') { setUnlocked(true); handleSave() }
                      else alert('Password salah')
                    }}
                    className="font-montserrat font-semibold text-sm text-white rounded-lg px-4 py-2"
                    style={{ background: '#E8470A' }}
                  >
                    Konfirmasi
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 font-montserrat font-semibold text-sm text-white rounded-xl py-3 disabled:opacity-40"
            style={{ background: '#5A8A0A' }}
          >
            {saving ? '...' : <><Save size={16} /> Simpan Konfigurasi</>}
          </button>
        </div>
      )}

      {tab === 'calc' && (
        <div className="grid lg:grid-cols-2 gap-6 max-w-4xl">
          {/* Input */}
          <div className="flex flex-col gap-4">
            <SectionCard title="Input Produksi">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Luas Permukaan (cm²)', name: 'surfaceArea', type: 'number' },
                  { label: 'Qty', name: 'qty', type: 'number' },
                  { label: 'Keliling Jahitan (cm)', name: 'seamsPerimeter', type: 'number' },
                  { label: 'Jalur Jahitan', name: 'seamsLanes', type: 'number' },
                ].map(f => (
                  <div key={f.name}>
                    <p className="font-inter text-xs mb-1" style={{ color: '#9CA3AF' }}>{f.label}</p>
                    <input
                      type={f.type}
                      value={(calcInput as any)[f.name] ?? ''}
                      onChange={e => updateCalc(f.name, parseFloat(e.target.value) || 0)}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <p className="font-inter text-xs mb-1" style={{ color: '#9CA3AF' }}>Tipe Sablon</p>
                  <select
                    value={calcInput.sablonType ?? 'none'}
                    onChange={e => updateCalc('sablonType', e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  >
                    <option value="none">Tidak ada</option>
                    <option value="dtf">DTF</option>
                    <option value="rubber">Rubber</option>
                  </select>
                </div>
                {calcInput.sablonType !== 'none' && (
                  <>
                    <div>
                      <p className="font-inter text-xs mb-1" style={{ color: '#9CA3AF' }}>Lebar Sablon (cm)</p>
                      <input type="number" onChange={e => updateCalc('sablonWidth', parseFloat(e.target.value))} className={inputClass} style={inputStyle} />
                    </div>
                    <div>
                      <p className="font-inter text-xs mb-1" style={{ color: '#9CA3AF' }}>Tinggi Sablon (cm)</p>
                      <input type="number" onChange={e => updateCalc('sablonHeight', parseFloat(e.target.value))} className={inputClass} style={inputStyle} />
                    </div>
                  </>
                )}
                <div className="col-span-2">
                  <p className="font-inter text-xs mb-1" style={{ color: '#9CA3AF' }}>Model Tas</p>
                  <select
                    value={calcInput.bagModel ?? 'handle'}
                    onChange={e => updateCalc('bagModel', e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  >
                    <option value="handle">Handle Jinjing</option>
                    <option value="serut">Serut</option>
                    <option value="thermal">Thermal</option>
                    <option value="box">Box</option>
                  </select>
                </div>
              </div>
            </SectionCard>

            <button
              onClick={handleCalc}
              className="flex items-center justify-center gap-2 font-montserrat font-semibold text-sm text-white rounded-xl py-3 transition-transform hover:scale-[1.02]"
              style={{ background: '#E8470A' }}
            >
              <Calculator size={16} /> Hitung COGS
            </button>
          </div>

          {/* Result */}
          {calcResult && (
            <div className="flex flex-col gap-4">
              <SectionCard title="Breakdown Biaya">
                {[
                  ['Kain', calcResult.kain],
                  ['Benang', calcResult.benang],
                  ['Velcro', calcResult.velcro],
                  ['Resleting', calcResult.resleting],
                  ['Mika', calcResult.mika],
                  ['Banner', calcResult.banner],
                  ['Sablon', calcResult.sablon],
                  ['Operasional', calcResult.operasional],
                  ['Model-spesifik', calcResult.modelSpesifik],
                ].filter(([, v]) => (v as number) > 0).map(([label, val]) => (
                  <div key={label as string} className="flex justify-between items-center py-1.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <span className="font-inter text-sm" style={{ color: '#6B7280' }}>{label}</span>
                    <span className="font-inter text-sm" style={{ color: '#374151' }}>{formatRupiah(val as number)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-1.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <span className="font-inter text-sm" style={{ color: '#6B7280' }}>BTTK ({calcResult.bttkPercent}%)</span>
                  <span className="font-inter text-sm" style={{ color: '#374151' }}>{formatRupiah(calcResult.bttk)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <span className="font-inter text-sm" style={{ color: '#6B7280' }}>Penyusutan ({calcResult.depreciationPercent}%)</span>
                  <span className="font-inter text-sm" style={{ color: '#374151' }}>{formatRupiah(calcResult.depreciation)}</span>
                </div>
              </SectionCard>

              <SectionCard title="Rekomendasi Harga">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { l: 'COGS /pcs', v: formatRupiah(calcResult.cogsFinal), c: '#E8470A' },
                    { l: 'Harga Jual /pcs', v: formatRupiah(calcResult.hargaJual), c: '#1A1A1A' },
                    { l: 'Total Qty', v: formatRupiah(calcResult.totalQty), c: '#5A8A0A' },
                    { l: 'Keuntungan', v: formatRupiah(calcResult.keuntungan), c: '#7AB611' },
                  ].map(item => (
                    <div key={item.l} className="rounded-lg p-3 text-center" style={{ background: '#F9FAF6' }}>
                      <p className="font-inter text-xs mb-1" style={{ color: '#9CA3AF' }}>{item.l}</p>
                      <p className="font-montserrat font-bold text-sm" style={{ color: item.c }}>{item.v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-lg p-3 text-center" style={{ background: 'rgba(90,138,10,0.08)' }}>
                  <p className="font-inter text-xs" style={{ color: '#9CA3AF' }}>Margin Aktual</p>
                  <p className="font-montserrat font-bold text-xl" style={{ color: '#5A8A0A' }}>
                    {calcResult.marginPercent.toFixed(1)}%
                  </p>
                </div>
              </SectionCard>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
