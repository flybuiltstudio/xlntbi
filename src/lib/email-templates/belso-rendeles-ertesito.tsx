import * as React from 'react'
import { Body, Container, Head, Html, Link, Preview, Section, Text } from '@react-email/components'

import { DataTable, Header, type Row } from './parts'
import type { TemplateEntry } from './registry'
import { BRAND, container, h1, main, paragraph, small } from './theme'

interface Props {
  orderNumber?: string
  productName?: string
  tierLabel?: string
  total?: string
  customerEmail?: string
  paymentStatus?: 'paid' | 'unpaid'
  rows?: Row[]
}

const LICENSE_PLACEHOLDER = '________________'

function licenseMailto(productName?: string, tierLabel?: string, customerEmail?: string): string {
  const name = productName || 'Termék'
  const subject = `${name} – beírandó licenc`
  const body = [
    'Tisztelt Vásárló!',
    '',
    'Küldöm a licencet az alábbi termékhez:',
    '',
    `Termék: ${name}`,
    `Licenc csomag: ${tierLabel || '—'}`,
    '',
    'Licenszkód:',
    `${LICENSE_PLACEHOLDER}  (IDE ÍRD A LICENSZKÓDOT)`,
    '',
    'Üdvözlettel:',
    'Sarinay Dávid',
    'XLNT BI',
  ].join('\n')
  return `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

const button = {
  display: 'inline-block',
  backgroundColor: BRAND.green,
  color: '#ffffff',
  borderRadius: '8px',
  padding: '10px 18px',
  fontWeight: 700,
  fontSize: '14px',
  textDecoration: 'none',
}

const Email = ({ orderNumber, productName, tierLabel, total, customerEmail, paymentStatus, rows }: Props) => (
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
          <>
            <Text style={paragraph}>
              <Link href={`mailto:${customerEmail}`}>Válasz a vevőnek: {customerEmail}</Link>
            </Text>
            <Section style={{ margin: '8px 0 16px' }}>
              <Link href={licenseMailto(productName, tierLabel, customerEmail)} style={button}>
                Licenc küldése a vevőnek
              </Link>
            </Section>
          </>
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
    tierLabel: 'Örökös licenc',
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
