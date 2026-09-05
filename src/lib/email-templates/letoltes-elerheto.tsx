import * as React from 'react'
import { Body, Button, Container, Head, Html, Preview, Section, Text } from '@react-email/components'

import { DataTable, Footer, Header, type Row } from './parts'
import type { TemplateEntry } from './registry'
import { BRAND, container, h1, main, paragraph, small } from './theme'

interface Props {
  name?: string
  orderNumber?: string
  productName?: string
  productLabel?: string
  tierLabel?: string
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
  backgroundColor: BRAND.green,
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '15px',
  fontWeight: 700,
  padding: '14px 26px',
  textDecoration: 'none',
}

const notice = {
  ...paragraph,
  color: '#C2410C',
  fontWeight: 700,
  margin: '16px 0 12px',
}

function buildMailto(name?: string, productName?: string, tierLabel?: string): string {
  const buyer = name || 'Vásárló'
  const product = productName || 'Termék'
  const tier = tierLabel || '—'
  const subject = `${buyer} – ${product} – ${tier} – LICENSZET KÉREK`
  // 16-character HWID placeholder (sample: 13B9D1D807614D61)
  const hwidBlank = '＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿'
  const body = [
    'Tisztelt Sarinay Dávid!',
    '',
    'Az alábbi termékre licenszkódot kérek:',
    '',
    `Vásárló neve:  ${buyer}`,
    `Termék:        ${product}`,
    `Licenc csomag: ${tier}`,
    `>> HWID: ${hwidBlank}  (KITÖLTENDŐ!) <<`,
  ].join('\n')
  return `mailto:info@xlntbi.hu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

const Email = ({
  name,
  orderNumber,
  productName,
  productLabel,
  tierLabel,
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
            {productLabel || productName || 'Termék'}
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
        <Text style={notice}>
          A letöltés után indítsd el / nyisd meg a megvásárolt terméket, és a megjelenő HWID-t küldd
          el a megvásárolt termék nevével és licensz típusával együtt az info@xlntbi.hu emailcímre.
        </Text>
        <Section style={{ margin: '0 0 20px' }}>
          <Button href={buildMailto(name, productName, tierLabel)} style={button}>
            Licenszet kérek e-mailben
          </Button>
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
    productName: 'XLNT NAV Online Számla letöltő',
    productLabel: 'XLNT NAV Online Számla letöltő – Örökös licenc (1 db)',
    tierLabel: 'Örökös licenc',
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
