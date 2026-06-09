import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { terbilang } from '@/lib/utils/terbilang'
import { formatRupiah } from '@/lib/utils/formatRupiah'
import type { Order } from '@/lib/db/schema'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1A1A1A' },
  perforated: {
    borderWidth: 2,
    borderColor: '#1A1A1A',
    borderStyle: 'dashed',
    padding: 24,
    position: 'relative',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  leftHeader: { fontSize: 9, color: '#6B7280', lineHeight: 1.6 },
  centerHeader: { alignItems: 'center' },
  kwitansiTitle: { fontSize: 24, fontFamily: 'Helvetica-Bold', letterSpacing: 3, color: '#1A1A1A' },
  rightHeader: { alignItems: 'flex-end', fontSize: 9 },
  fakturLabel: { color: '#5A8A0A', fontFamily: 'Helvetica-Bold', marginBottom: 2 },

  bodySection: { marginBottom: 16 },
  fieldRow: { flexDirection: 'row', marginBottom: 6 },
  fieldLabel: { width: '35%', color: '#6B7280', fontSize: 9 },
  fieldValue: { width: '65%', fontFamily: 'Helvetica-Bold' },
  terbilangBox: {
    borderWidth: 1, borderColor: '#1A1A1A', padding: '6 10',
    marginBottom: 16, fontSize: 9, fontStyle: 'italic', color: '#374151',
  },

  table: { marginBottom: 16 },
  tableHeader: {
    flexDirection: 'row', backgroundColor: '#5A8A0A',
    color: '#FFFFFF', padding: '6 8', fontSize: 9, fontFamily: 'Helvetica-Bold',
  },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', padding: '5 8' },
  col0: { width: '8%' },
  col1: { width: '65%' },
  col2: { width: '27%', textAlign: 'right' },
  totalRow: {
    flexDirection: 'row', backgroundColor: '#5A8A0A', padding: '6 8',
    color: '#FFFFFF', fontFamily: 'Helvetica-Bold',
  },

  footerSection: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  footerLeft: { width: '50%', fontSize: 9, lineHeight: 1.8 },
  footerLabelGreen: { color: '#5A8A0A', fontFamily: 'Helvetica-Bold' },
  footerLabelRed: { color: '#E8470A', fontFamily: 'Helvetica-Bold' },

  stampWrapper: {
    position: 'absolute', right: 40, bottom: 40,
    width: 100, height: 100,
    transform: 'rotate(-15deg)',
    alignItems: 'center', justifyContent: 'center',
  },
  stampCircle: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  stampSBC: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#5A8A0A', letterSpacing: 1 },
  stampLunas: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#1A1A1A', marginVertical: 2 },
  stampFalghe: { fontSize: 7, color: '#6B7280' },
})

interface KwitansiPDFProps {
  order: Order
  invoiceNumber: string
}

export function KwitansiPDF({ order, invoiceNumber }: KwitansiPDFProps) {
  const payments = Array.isArray(order.payments) ? order.payments as any[] : []
  const totalPaid = payments.reduce((s: number, p: any) => s + Number(p.amount), 0)
  const sellingPrice = Number(order.sellingPrice ?? 0)
  const sisaHutang = Math.max(0, sellingPrice - totalPaid)
  const isLunas = sisaHutang === 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.perforated}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.leftHeader, { fontFamily: 'Helvetica-Bold' }]}>spundbondcraft.id</Text>
              <Text style={styles.leftHeader}>Sukoharjo, Jawa Tengah</Text>
            </View>
            <View style={styles.centerHeader}>
              <Text style={styles.kwitansiTitle}>KWITANSI</Text>
            </View>
            <View style={styles.rightHeader}>
              <Text style={styles.fakturLabel}>Faktur No: {invoiceNumber}</Text>
              <Text style={{ fontSize: 9, color: '#6B7280' }}>No Pelanggan: {order.codeFixed ?? order.codePra}</Text>
            </View>
          </View>

          {/* Body */}
          <View style={styles.bodySection}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Telah diterima dari</Text>
              <Text style={styles.fieldValue}>: {order.clientName}{order.companyName ? ` — ${order.companyName}` : ''}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Sejumlah uang</Text>
              <Text style={styles.fieldValue}>: {formatRupiah(totalPaid)}</Text>
            </View>
          </View>

          <View style={styles.terbilangBox}>
            <Text>{terbilang(totalPaid)}</Text>
          </View>

          {/* Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col0}>No</Text>
              <Text style={styles.col1}>Keterangan</Text>
              <Text style={styles.col2}>Jumlah</Text>
            </View>
            {payments.map((p: any, i: number) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.col0}>{i + 1}</Text>
                <Text style={styles.col1}>{p.description ?? `Angsuran ${i + 1}`} — {p.date ?? ''}</Text>
                <Text style={styles.col2}>{formatRupiah(p.amount)}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.col0}></Text>
              <Text style={styles.col1}>TOTAL</Text>
              <Text style={styles.col2}>{formatRupiah(totalPaid)}</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footerSection}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerLabelGreen}>Total Angsuran  : {formatRupiah(totalPaid)}</Text>
              <Text style={styles.footerLabelRed}>Sisa Hutang     : {formatRupiah(sisaHutang)}</Text>
              <Text>Status          : {isLunas ? 'LUNAS' : 'Belum Lunas'}</Text>
              <Text>Jatuh Tempo     : {isLunas ? 'Ready for Shipment' : order.estimatedDone
                ? new Date(order.estimatedDone).toLocaleDateString('id-ID') : '-'}</Text>
            </View>
          </View>

          {/* Stamp LUNAS — only if paid off, DO NOT MODIFY DESIGN */}
          {isLunas && (
            <View style={styles.stampWrapper}>
              <View style={styles.stampCircle}>
                <Text style={styles.stampSBC}>SBC.ID</Text>
                <Text style={styles.stampLunas}>LUNAS</Text>
                <Text style={styles.stampFalghe}>by FALGHE</Text>
              </View>
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}
