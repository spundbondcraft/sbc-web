import type { CogsConfig } from '@/lib/db/schema'

export interface CogsInput {
  surfaceArea: number        // cm²
  qty: number
  seamsPerimeter: number    // cm keliling jahitan
  seamsLanes: number        // jumlah jalur

  sablonType: 'dtf' | 'rubber' | 'none'
  sablonWidth?: number      // cm
  sablonHeight?: number     // cm
  rubberBinderGram?: number
  rubberRubberGram?: number
  rubberPigmentGram?: number

  velcro?: boolean
  velcroCm?: number
  resleting?: boolean
  resletingQty?: number
  mika?: boolean
  mikaWidth?: number
  mikaHeight?: number
  banner?: boolean
  bannerWidth?: number
  bannerHeight?: number

  bagModel: string
  // serut
  bagWidth?: number
  // thermal
  thermalCm?: number

  includeGasoline?: boolean
  includeElectricity?: boolean
}

export interface CogsBreakdown {
  kain: number
  benang: number
  velcro: number
  resleting: number
  mika: number
  banner: number
  sablon: number
  operasional: number
  modelSpesifik: number
  subtotalA: number
  bttk: number
  subtotalB: number
  depreciation: number
  cogsFinal: number
  hargaJual: number
  keuntungan: number
  marginPercent: number
  perPcs: number
  totalQty: number
  bttkPercent: number
  depreciationPercent: number
}

export function calculateCogs(input: CogsInput, config: CogsConfig): CogsBreakdown {
  const c = {
    fabricPrice: Number(config.fabricPricePerMeter),
    threadPrice: Number(config.threadPricePerRoll),
    threadLength: Number(config.threadLengthPerRoll),
    velcroPrice: Number(config.velcroPricePerRoll),
    velcroLength: Number(config.velcroLengthPerRoll),
    zipperPrice: Number(config.zipperPricePerPcs),
    mikaPrice: Number(config.mikaPricePerCm2),
    mikaExtra: Number(config.mikaExtraSewing),
    bannerPrice: Number(config.bannerPricePerCm2),
    bannerExtra: Number(config.bannerExtraSewing),
    dtfPrice: Number(config.dtfPricePerCm2),
    rubberBinder: Number(config.rubberBinderPerGram),
    rubberRubber: Number(config.rubberRubberPerGram),
    rubberPigment: Number(config.rubberPigmentPerGram),
    rubberLabor: Number(config.rubberLabor),
    rubberFilm: Number(config.rubberFilm),
    gasoline: Number(config.gasolineCost),
    electricity: Number(config.electricityCostPerOrder),
    rope: Number(config.ropePricePerCm),
    foilLength: Number(config.aluminumFoilLength),
    foilPrice: Number(config.aluminumFoilPrice),
    bttk: Number(config.bttkPercent),
    depreciation: Number(config.depreciationPercent),
    margin: Number(config.marginPercent),
  }

  // [1] Kain
  const kain = (input.surfaceArea / 10000) * c.fabricPrice

  // [2] Benang
  const threadLen = input.seamsPerimeter * input.seamsLanes * 4
  const benang = (threadLen / c.threadLength) * c.threadPrice

  // [3] Additional
  const velcro = input.velcro && input.velcroCm
    ? (input.velcroCm / c.velcroLength) * c.velcroPrice : 0
  const resleting = input.resleting && input.resletingQty
    ? input.resletingQty * c.zipperPrice : 0
  const mika = input.mika && input.mikaWidth && input.mikaHeight
    ? (input.mikaWidth * input.mikaHeight * c.mikaPrice) + c.mikaExtra : 0
  const banner = input.banner && input.bannerWidth && input.bannerHeight
    ? (input.bannerWidth * input.bannerHeight * c.bannerPrice) + c.bannerExtra : 0

  // [4] Sablon — force DTF if qty < 50
  const effectiveSablon = input.qty < 50 ? 'dtf' : input.sablonType
  let sablon = 0
  if (effectiveSablon === 'dtf' && input.sablonWidth && input.sablonHeight) {
    sablon = input.sablonWidth * input.sablonHeight * c.dtfPrice * 1.1
  } else if (effectiveSablon === 'rubber') {
    sablon = ((input.rubberBinderGram ?? 0) * c.rubberBinder)
      + ((input.rubberRubberGram ?? 0) * c.rubberRubber)
      + ((input.rubberPigmentGram ?? 0) * c.rubberPigment)
      + c.rubberLabor + c.rubberFilm
  }

  // [5] Operasional
  const operasional = (input.includeGasoline ? c.gasoline : 0)
    + (input.includeElectricity ? c.electricity : 0)

  // [6] Model spesifik
  let modelSpesifik = 0
  if (input.bagModel === 'serut' && input.bagWidth) {
    modelSpesifik = ((input.bagWidth * 4) + 40) * c.rope
  } else if (input.bagModel === 'thermal' && input.thermalCm) {
    modelSpesifik = (input.thermalCm / c.foilLength) * c.foilPrice
  }

  const subtotalA = kain + benang + velcro + resleting + mika + banner + sablon + operasional + modelSpesifik
  const bttkAmount = (c.bttk / 100) * subtotalA
  const subtotalB = subtotalA + bttkAmount
  const depreciationAmount = (c.depreciation / 100) * subtotalB
  const cogsFinal = subtotalB + depreciationAmount
  const hargaJual = cogsFinal / (1 - c.margin / 100)
  const keuntungan = hargaJual - cogsFinal
  const actualMargin = (keuntungan / hargaJual) * 100

  return {
    kain, benang, velcro, resleting, mika, banner,
    sablon, operasional, modelSpesifik,
    subtotalA, bttk: bttkAmount, subtotalB,
    depreciation: depreciationAmount,
    cogsFinal, hargaJual, keuntungan,
    marginPercent: actualMargin,
    perPcs: hargaJual,
    totalQty: hargaJual * input.qty,
    bttkPercent: c.bttk,
    depreciationPercent: c.depreciation,
  }
}
