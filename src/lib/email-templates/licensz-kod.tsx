import * as React from 'react'
import { Body, Container, Head, Html, Preview, Section, Text } from '@react-email/components'

import { Footer, Header } from './parts'
import type { TemplateEntry } from './registry'
import { BRAND, container, h1, main, paragraph, small } from './theme'

interface Props {
  name?: string
  orderNumber?: string
  productName?: string
  tierLabel?: string
  licenseKey?: string
}

const box = {
  backgroundColor: BRAND.soft,
  border: `1px solid ${BRAND.line}`,
  borderRadius: '10px',
  padding: '16px 18px',
  margin: '0 0 20px',
}

const code = {
  fontFamily: 'Consolas, Menlo, Monaco, "Courier New", monospace',
  fontSize: '10px',
  lineHeight: '22px',
  color: BRAND.green,
  fontWeight: 700,
  whiteSpace: 'nowrap' as const,
  backgroundColor: '#ffffff',
  border: `1px solid ${BRAND.line}`,
  borderRadius: '8px',
  padding: '12px 14px',
  margin: '0',
}

const Email = ({ name, orderNumber, productName, tierLabel, licenseKey }: Props) => (
  <Html lang="hu" dir="ltr">
    <Head />
    <Preview>{`Licenckód – ${productName || 'xlntbi.hu'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header subtitle="Licenckód" />
        <Text style={h1}>Itt van a licenckódod</Text>
        <Text style={paragraph}>Kedves {name || 'Vásárló'}!</Text>
        <Text style={paragraph}>
          Köszönöm a vásárlást! Az alábbiakban megtalálod a megvásárolt termékhez tartozó
          licenckódot.
        </Text>
        <Section style={box}>
          <Text style={{ ...paragraph, margin: '0 0 4px', fontWeight: 700 }}>
            {productName || 'Termék'}
          </Text>
          <Text style={{ ...small, margin: '0 0 12px' }}>
            Licenc típusa: {tierLabel || '—'}
            {orderNumber ? ` · Rendelésszám: ${orderNumber}` : ''}
          </Text>
          <Text style={{ ...small, margin: '0 0 6px', fontWeight: 700 }}>Licenckód:</Text>
          <Text style={code}>{licenseKey || '—'}</Text>
          <Text style={{ ...small, margin: '10px 0 0' }}>
            A licenckódot egyben másold be a programba.
          </Text>
        </Section>
        <Text style={paragraph}>
          Ha bármi kérdésed van, írj bátran az <strong>info@xlntbi.hu</strong> e-mail címre.
        </Text>
        <Footer />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Licenckód – ${data['productName'] || 'xlntbi.hu'}`,
  displayName: 'Licenckód',
  previewData: {
    name: 'Kovács Anna',
    orderNumber: 'XLNT-20260819-1234',
    productName: 'XLNT NAV Online Számla letöltő',
    tierLabel: 'Örökös licenc',
    licenseKey:
      'X000-0000-0000-0000-0202-6083-1000-0000-0202-6081-1689-B92F-E556-1813-8C18-79F6-C',
  },
} satisfies TemplateEntry
