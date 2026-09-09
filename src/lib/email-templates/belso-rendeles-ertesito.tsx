import * as React from 'react'
import { Body, Container, Head, Html, Link, Preview, Text } from '@react-email/components'

import { DataTable, Header, type Row } from './parts'
import type { TemplateEntry } from './registry'
import { container, h1, main, paragraph, small } from './theme'

interface Props {
  orderNumber?: string
  productName?: string
  total?: string
  customerEmail?: string
  paymentStatus?: 'paid' | 'unpaid'
  rows?: Row[]
}

const Email = ({ orderNumber, productName, total, customerEmail, paymentStatus, rows }: Props) => (
  <Html lang="hu" dir="ltr">
    <Head />
    <Preview>{`Új megrendelés: ${productName || ''} – ${total || ''}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header subtitle="Belső értesítő – új megrendelés" />
        <Text style={h1}>Új megrendelés ({orderNumber || '—'})</Text>
        <Text style={paragraph}>
          {productName || 'Termék'} · {total || '—'} ·{' '}
          {paymentStatus === 'paid' ? 'kifizetve' : 'fizetésre vár'}
        </Text>
        {rows && rows.length > 0 ? <DataTable rows={rows} /> : null}
        {customerEmail ? (
          <Text style={paragraph}>
            <Link href={`mailto:${customerEmail}`}>Válasz a vevőnek: {customerEmail}</Link>
          </Text>
        ) : null}
        <Text style={small}>A megrendelés az adatbázisban is rögzítve van.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => {
    const status = data['paymentStatus'] === 'paid' ? 'kifizetve' : 'fizetésre vár'
    return `Új megrendelés (${data['orderNumber'] || 'xlntbi.hu'}): ${data['productName'] || ''} – ${status}`
  },
  displayName: 'Belső értesítő – megrendelés',
  previewData: {
    orderNumber: 'XLNT-20260819-1234',
    productName: 'XLNT NAV Online Számla letöltő (1 db)',
    total: '19 900 Ft',
    customerEmail: 'anna@pelda.hu',
    paymentStatus: 'unpaid',
    rows: [
      ['Rendelésszám', 'XLNT-20260819-1234'],
      ['Termék', 'XLNT NAV Online Számla letöltő (1 db)'],
      ['Fizetendő', '19 900 Ft'],
      ['Számlázási név', 'Kovács Anna'],
      ['E-mail', 'anna@pelda.hu'],
      ['Telefon', '20/123-4567'],
    ] as Row[],
  },
} satisfies TemplateEntry
