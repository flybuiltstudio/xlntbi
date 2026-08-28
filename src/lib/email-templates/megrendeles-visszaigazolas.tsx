import * as React from 'react'
import { Body, Container, Head, Html, Preview, Section, Text } from '@react-email/components'

import { DataTable, Footer, Header, type Row } from './parts'
import type { TemplateEntry } from './registry'
import { BRAND, container, h1, main, paragraph, small } from './theme'

interface Props {
  name?: string
  orderNumber?: string
  productName?: string
  total?: string
  rows?: Row[]
  /** 'paid' when the order was settled online, otherwise bank transfer flow. */
  paymentStatus?: 'paid' | 'unpaid'
}

const box = {
  backgroundColor: BRAND.soft,
  border: `1px solid ${BRAND.line}`,
  borderRadius: '10px',
  padding: '16px 18px',
  margin: '0 0 20px',
}

const Email = ({ name, orderNumber, productName, total, rows, paymentStatus }: Props) => (
  <Html lang="hu" dir="ltr">
    <Head />
    <Preview>{`Megrendelés visszaigazolása – ${orderNumber || ''}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header subtitle="Megrendelés visszaigazolása" />
        <Text style={h1}>Köszönöm a megrendelésedet!</Text>
        <Text style={paragraph}>Kedves {name || 'Vásárló'}!</Text>
        <Text style={paragraph}>
          A megrendelésedet rögzítettem az alábbi adatokkal. Kérlek, ellenőrizd a
          számlázási adatokat, és ha bármi javítandó, válaszolj erre a levélre.
        </Text>
        <Section style={box}>
          <Text style={{ ...paragraph, margin: '0 0 4px', fontWeight: 700 }}>
            {productName || 'Termék'}
          </Text>
          <Text style={{ ...small, margin: '0' }}>
            Rendelésszám: {orderNumber || '—'} · Fizetendő: {total || '—'}
          </Text>
        </Section>
        {rows && rows.length > 0 ? <DataTable rows={rows} /> : null}
        {paymentStatus === 'paid' ? (
          <Text style={paragraph}>
            <strong>Fizetés:</strong> a bankkártyás fizetés sikeresen megtörtént, a
            megrendelés rendezett. A számlát és a letöltési tudnivalókat hamarosan
            elküldöm erre az e-mail címre.
          </Text>
        ) : (
          <Text style={paragraph}>
            <strong>Fizetés:</strong> a megrendelést átutalással rendezheted. A számlát a
            fizetési adatokkal együtt hamarosan elküldöm erre az e-mail címre, a szoftver
            letöltési linkjét pedig a teljesítést követően kapod meg.
          </Text>
        )}
        <Text style={paragraph}>
          A termék digitális, ezért szállítási cím nem szükséges. Az elállási jogról és a
          teljesítés menetéről az oldal jogi tájékoztatóiban olvashatsz.
        </Text>
        <Footer />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Megrendelés visszaigazolása – ${data['orderNumber'] || 'xlntbi.hu'}`,
  displayName: 'Megrendelés – visszaigazoló',
  previewData: {
    name: 'Kovács Anna',
    orderNumber: 'XLNT-20260819-1234',
    productName: 'XLNT NAV Online Számla letöltő (1 db)',
    total: '19 900 Ft',
    paymentStatus: 'unpaid',
    rows: [
      ['Termék', 'XLNT NAV Online Számla letöltő (1 db)'],
      ['Egységár', '19 900 Ft'],
      ['Fizetendő', '19 900 Ft'],
      ['Számlázási név', 'Kovács Anna'],
      ['Számlázási cím', 'Magyarország, 1013 Budapest, Példa utca 1.'],
      ['E-mail', 'anna@pelda.hu'],
    ] as Row[],
  },
} satisfies TemplateEntry
