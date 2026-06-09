import {
  pgTable, text, integer, decimal, timestamp,
  boolean, jsonb, index
} from 'drizzle-orm/pg-core'

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  codePra: text('code_pra').unique(),
  codeFixed: text('code_fixed').unique(),
  codePraActive: boolean('code_pra_active').default(true),
  clientName: text('client_name').notNull(),
  companyName: text('company_name'),
  whatsapp: text('whatsapp').notNull(),
  address: text('address'),
  bagModel: text('bag_model').notNull(),
  bagColor: text('bag_color'),
  bagGsm: integer('bag_gsm'),
  surfaceArea: decimal('surface_area'),
  qty: integer('qty').notNull(),
  sablonType: text('sablon_type'),
  sablonWidth: decimal('sablon_width'),
  sablonHeight: decimal('sablon_height'),
  additionalOptions: jsonb('additional_options'),
  handleType: text('handle_type'),
  notes: text('notes'),
  internalNotes: text('internal_notes'),
  cogsTotal: decimal('cogs_total'),
  cogsBreakdown: jsonb('cogs_breakdown'),
  sellingPrice: decimal('selling_price'),
  phase: text('phase').default('pra'),
  productionStatus: text('production_status').default('received'),
  payments: jsonb('payments').default('[]'),
  invoiceNumber: text('invoice_number'),
  invoiceUrl: text('invoice_url'),
  kwitansiUrl: text('kwitansi_url'),
  estimatedDone: timestamp('estimated_done'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  codePraIdx: index('orders_code_pra_idx').on(table.codePra),
  codeFixedIdx: index('orders_code_fixed_idx').on(table.codeFixed),
  phaseIdx: index('orders_phase_idx').on(table.phase),
  statusIdx: index('orders_status_idx').on(table.productionStatus),
}))

export const cogsConfig = pgTable('cogs_config', {
  id: text('id').primaryKey().default('singleton'),
  fabricPricePerMeter: decimal('fabric_price_per_meter').default('0'),
  threadPricePerRoll: decimal('thread_price_per_roll').default('0'),
  threadLengthPerRoll: decimal('thread_length_per_roll').default('0'),
  velcroPricePerRoll: decimal('velcro_price_per_roll').default('0'),
  velcroLengthPerRoll: decimal('velcro_length_per_roll').default('0'),
  zipperPricePerPcs: decimal('zipper_price_per_pcs').default('0'),
  mikaPricePerCm2: decimal('mika_price_per_cm2').default('0'),
  mikaExtraSewing: decimal('mika_extra_sewing').default('0'),
  bannerPricePerCm2: decimal('banner_price_per_cm2').default('0'),
  bannerExtraSewing: decimal('banner_extra_sewing').default('0'),
  dtfPricePerCm2: decimal('dtf_price_per_cm2').default('0'),
  rubberBinderPerGram: decimal('rubber_binder_per_gram').default('0'),
  rubberRubberPerGram: decimal('rubber_rubber_per_gram').default('0'),
  rubberPigmentPerGram: decimal('rubber_pigment_per_gram').default('0'),
  rubberLabor: decimal('rubber_labor').default('0'),
  rubberFilm: decimal('rubber_film').default('0'),
  gasolineCost: decimal('gasoline_cost').default('0'),
  electricityCostPerOrder: decimal('electricity_cost_per_order').default('0'),
  ropePricePerCm: decimal('rope_price_per_cm').default('0'),
  aluminumFoilLength: decimal('aluminum_foil_length').default('0'),
  aluminumFoilPrice: decimal('aluminum_foil_price').default('0'),
  bttkPercent: decimal('bttk_percent').default('20'),
  depreciationPercent: decimal('depreciation_percent').default('2'),
  marginPercent: decimal('margin_percent').default('25'),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const portfolio = pgTable('portfolio', {
  id: text('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  cloudinaryId: text('cloudinary_id').notNull(),
  blurDataUrl: text('blur_data_url'),
  bagModel: text('bag_model').notNull(),
  sablonType: text('sablon_type'),
  color: text('color'),
  sortOrder: integer('sort_order').default(0),
  isVisible: boolean('is_visible').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  visibleIdx: index('portfolio_visible_idx').on(table.isVisible, table.sortOrder),
}))

export const ecoCounter = pgTable('eco_counter', {
  id: text('id').primaryKey().default('singleton'),
  fabricRescuedKg: decimal('fabric_rescued_kg').default('0'),
  bagsCollectedPcs: integer('bags_collected_pcs').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  orderId: text('order_id'),
  orderCode: text('order_code'),
  clientName: text('client_name'),
  message: text('message'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type CogsConfig = typeof cogsConfig.$inferSelect
export type Portfolio = typeof portfolio.$inferSelect
export type EcoCounter = typeof ecoCounter.$inferSelect
export type Notification = typeof notifications.$inferSelect
