import * as React from 'react'
import { Body, Button, Container, Head, Html, Preview, Section, Text } from '@react-email/components'

import { DataTable, Footer, Header, type Row } from './parts'
import type { TemplateEntry } from './registry'
import { BRAND, container, h1, main, paragraph, small } from './theme'

interface Props {
  name?: string
  orderNumber?: string
  productName?: string
  fileName?: string
  downloadUrl?: string
  expiresAt?: string
  maxDownloads?: number
  rows?: Row[]
}

const box = {
  backgroundColor: BRAND.soft,
  border: `1px solid ${BRAND.line}`,
  borderRadius: '10px',
  padding: '16px 18px',
  margin: '0 0 20px',
}

const button = {
  backgroundColor: BRAND.primary,
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '15px',
  fontWeight: 700,
  padding: '14px 26px',
  textDecoration: 'none',
}

const Email = ({
  name,
  orderNumber,
  productName,
  fileName,
  downloadUrl,
  expiresAt,
  maxDownloads,
  rows,
}: Props) => (
  <Html lang="hu" dir="ltr">
    <Head />
    <Preview>{`A megvásárolt szoftver letöltése – ${orderNumber || ''}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header subtitle="Letöltés elérhető" />
        <Text style={h1}>Itt van a letöltési linked</Text>
        <Text style={paragraph}>Kedves {name || 'Vásárló'}!</Text>
        <Text style={paragraph}>
          A megrendelésed rendezett, a szoftver letölthető az alábbi linkre kattintva.
        </Text>
        <Section style={box}>
          <Text style={{ ...paragraph, margin: '0 0 4px', fontWeight: 700 }}>
            {productName || 'Termék'}
          </Text>
          <Text style={{ ...small, margin: '0 0 14px' }}>
            Rendelésszám: {orderNumber || '—'} · Fájl: {fileName || '—'}
          </Text>
          {downloadUrl ? (
            <Button href={downloadUrl} style={button}>
              Szoftver letöltése
            </Button>
          ) : null}
        </Section>
        {rows && rows.length > 0 ? <DataTable rows={rows} /> : null}
        <Text style={paragraph}>
          <strong>Fontos:</strong> a link {expiresAt ? `${expiresAt}-ig` : '14 napig'} él, és
          legfeljebb {maxDownloads ?? 10} alkalommal használható fel. Kérlek, mentsd le a fájlt
          a saját gépedre. Ha lejárt vagy elveszett a link, válaszolj erre a levélre, és küldök
          újat.
        </Text>
        <Text style={paragraph}>
          A licenc a megrendelésben szereplő csomagra érvényes, továbbadása nem engedélyezett.
          Ha bármiben elakadsz a telepítéssel vagy a használattal, írj bátran.
        </Text>
        <Footer />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Letöltés elérhető – ${data['productName'] || 'xlntbi.hu'}`,
  displayName: 'Letöltési link',
  previewData: {
    name: 'Kovács Anna',
    orderNumber: 'XLNT-20260819-1234',
    productName: 'NAV Online Számla letöltő – Örökös licenc (1 db)',
    fileName: 'nav-online-szamla-letolto.zip',
    downloadUrl: 'https://xlntbi.hu/letoltes/abc123',
    expiresAt: '2026. 09. 02.',
    maxDownloads: 10,
    rows: [
      ['Rendelésszám', 'XLNT-20260819-1234'],
      ['Licenc csomag', 'Örökös licenc'],
    ] as Row[],
  },
} satisfies TemplateEntry
