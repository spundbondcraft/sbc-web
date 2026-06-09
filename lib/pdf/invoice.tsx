import React from 'react'
import {
  Document, Page, Text, View, StyleSheet, Font, Image
} from '@react-pdf/renderer'
import { terbilang } from '@/lib/utils/terbilang'
import { formatRupiah } from '@/lib/utils/formatRupiah'
import type { Order } from '@/lib/db/schema'

Font.register({
  family: 'Montserrat',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXp-p7K4KLjztg.woff2' },
    { src: 'https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCu170w5aXp-p7K4KLjztg.woff2', fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1A1A1A' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  logoArea: { flexDirection: 'column' },
  invoiceTitle: { fontFamily: 'Montserrat', fontSize: 28, fontWeight: 700, color: '#E8470A' },
  companyName: { fontFamily: 'Montserrat', fontSize: 11, fontWeight: 700 },
  rightHeader: { alignItems: 'flex-end' },
  supportText: { fontSize: 9, color: '#6B7280' },
  dot: { color: '#E8470A' },
  invoiceNo: { fontFamily: 'Montserrat', fontWeight: 700, fontSize: 13, marginTop: 4 },
  dateText: { fontSize: 9, color: '#6B7280', marginTop: 2 },

  addressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  addressBox: { width: '45%' },
  addressLabel: { fontFamily: 'Montserrat', fontWeight: 700, fontSize: 9, color: '#E8470A', textTransform: 'uppercase', marginBottom: 6 },
  addressLine: { fontSize: 10, lineHeight: 1.6 },

  table: { marginBottom: 16 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#5A8A0A', color: '#FFFFFF', padding: 8, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 9 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', padding: '6 8' },
  col0: { width: '5%' },
  col1: { width: '40%' },
  col2: { width: '15%' },
  col3: { width: '10%' },
  col4: { width: '15%' },
  col5: { width: '15%', textAlign: 'right' },

  summaryRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 },
  summaryLabel: { width: '30%', textAlign: 'right', color: '#6B7280', paddingRight: 16 },
  summaryValue: { width: '20%', textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: '#5A8A0A', padding: '8 12', marginBottom: 24 },
  totalLabel: { width: '30%', textAlign: 'right', color: '#FFFFFF', fontFamily: 'Montserrat', fontWeight: 700, paddingRight: 16 },
  totalValue: { width: '20%', textAlign: 'right', color: '#FFFFFF', fontFamily: 'Montserrat', fontWeight: 700 },

  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  paymentBox: { width: '45%' },
  paymentLabel: { fontFamily: 'Montserrat', fontWeight: 700, fontSize: 9, color: '#5A8A0A', marginBottom: 6, textTransform: 'uppercase' },
  paymentLine: { fontSize: 9, lineHeight: 1.7 },
  noteBox: { width: '50%' },
  noteText: { fontSize: 8, color: '#6B7280', lineHeight: 1.7, fontStyle: 'italic' },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  badge: { backgroundColor: '#F3F4F6', padding: '3 8', borderRadius: 4, fontSize: 8, color: '#374151' },

  footer: { marginTop: 32, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12, alignItems: 'center' },
  footerMain: { fontFamily: 'Montserrat', fontWeight: 700, fontSize: 9, color: '#1A1A1A' },
  footerSub: { fontSize: 8, color: '#9CA3AF', fontStyle: 'italic', marginTop: 2 },
})

interface InvoicePDFProps {
  order: Order
  invoiceNumber: string
  packagingFee?: number
}

export function InvoicePDF({ order, invoiceNumber, packagingFee = 0 }: InvoicePDFProps) {
  const sellingPrice = Number(order.sellingPrice ?? 0)
  const total = sellingPrice + packagingFee
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.logoArea}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.companyName}>SBC.ID — SpundbondCraft.ID</Text>
          </View>
          <View style={styles.rightHeader}>
            <Text style={styles.supportText}>support by FALGHE <Text style={styles.dot}>●</Text></Text>
            <Text style={styles.invoiceNo}>No: {invoiceNumber}</Text>
            <Text style={styles.dateText}>Date: {today}</Text>
          </View>
        </View>

        {/* From / Bill To */}
        <View style={styles.addressRow}>
          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>From</Text>
            <Text style={styles.addressLine}>SBC.ID | Customizeable Spunbond Bag{'\n'}</Text>
            <Text style={styles.addressLine}>@spundbondcraft.id{'\n'}</Text>
            <Text style={styles.addressLine}>08787-2710-673{'\n'}</Text>
            <Text style={styles.addressLine}>Sukoharjo, Indonesia</Text>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>Bill To</Text>
            <Text style={styles.addressLine}>
              Tuan/Nyonya  : {order.clientName}{'\n'}
              Perusahaan   : {order.companyName ?? '-'}{'\n'}
              Contact      : {order.whatsapp}{'\n'}
              Alamat       : {order.address ?? '-'}
            </Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col0}>No</Text>
            <Text style={styles.col1}>Item</Text>
            <Text style={styles.col2}>Size</Text>
            <Text style={styles.col3}>Qty</Text>
            <Text style={styles.col4}>Price</Text>
            <Text style={styles.col5}>Total</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.col0}>1</Text>
            <Text style={styles.col1}>
              {order.bagModel} — {order.bagColor ?? ''}{'\n'}
              GSM: {order.bagGsm ?? '-'} | Sablon: {order.sablonType ?? 'Tidak ada'}
            </Text>
            <Text style={styles.col2}>{order.surfaceArea ? `${order.surfaceArea} cm²` : '-'}</Text>
            <Text style={styles.col3}>{order.qty} pcs</Text>
            <Text style={styles.col4}>{formatRupiah(sellingPrice / order.qty)}</Text>
            <Text style={styles.col5}>{formatRupiah(sellingPrice)}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatRupiah(sellingPrice)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Design Fee</Text>
          <Text style={styles.summaryValue}>Free</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Packaging</Text>
          <Text style={styles.summaryValue}>{packagingFee > 0 ? formatRupiah(packagingFee) : 'Free'}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL PAYMENT</Text>
          <Text style={styles.totalValue}>{formatRupiah(total)}</Text>
        </View>

        {/* Bottom */}
        <View style={styles.bottomRow}>
          <View style={styles.paymentBox}>
            <Text style={styles.paymentLabel}>Payment Info</Text>
            <Text style={styles.paymentLine}>
              Bank BCA{'\n'}
              a.n: IRFANUDIN FREDYANSAH{'\n'}
              No Rek: 0153932732{'\n'}
              DP: min. 50%{'\n'}
              Pelunasan: sebelum pengiriman
            </Text>
          </View>
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              *harga tertera belum termasuk ongkos pengiriman{'\n'}
              (invoice pengiriman release sebelum tahapan ready to ship){'\n'}
              Terima kasih atas kepercayaan anda kepada SBC.ID
            </Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}><Text>Handcrafted</Text></View>
              <View style={styles.badge}><Text>Eco-Friendly</Text></View>
              <View style={styles.badge}><Text>Free design</Text></View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerMain}>crafted with care by SBC.ID</Text>
          <Text style={styles.footerSub}>──── a better choice for a better habbit ────</Text>
        </View>
      </Page>
    </Document>
  )
}
