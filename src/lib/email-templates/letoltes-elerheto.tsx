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
  isKnowledge?: boolean
  isFree?: boolean
  isDemo?: boolean
  demoHwid?: string
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

function buildMailto(name?: string, productName?: string, tierLabel?: string, isDemo?: boolean, demoHwid?: string): string {
  const buyer = name || 'Vásárló'
  const product = productName || 'Termék'
  const tier = tierLabel || '—'
  const demoPrefix = isDemo ? 'CSAK DEMO – ' : ''
  const subject = `${demoPrefix}${buyer} – ${product} – ${tier} – LICENSZET KÉREK`
  const hwidValue = isDemo && demoHwid ? demoHwid : '＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿'
  const hwidNote = isDemo && demoHwid
    ? '(az igényléskor megadott azonosító)'
    : '(KITÖLTENDŐ!)'
  const body = [
    'Tisztelt Sarinay Dávid!',
    '',
    isDemo ? 'CSAK DEMO LICENCET KÉREK!' : 'Az alábbi termékre licenszkódot kérek:',
    '',
    `Vásárló neve:  ${buyer}`,
    `Termék:        ${product}`,
    `Licenc csomag: ${tier}`,
    `>>  Gépazonosító (HWID):  ${hwidValue}  ${hwidNote} <<`,
    '',
    'Indítsd el a megvásárolt programot. A licencaktiváló ablakban megtalálod a „Gépazonosító (HWID)” értéket. Kattints a „HWID vágólapra másolás” gombra, majd illeszd be ide az emailbe, a fenti vonalak helyére ezt az azonosítót, és küldd el ezt a levelet.',
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
  isKnowledge,
  isFree,
  isDemo,
  demoHwid,
  rows,
}: Props) => (
  <Html lang="hu" dir="ltr">
    <Head />
    <Preview>{`${isFree ? 'Az ingyenes kiadvány' : 'A megvásárolt termék'} letöltése – ${orderNumber || ''}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header subtitle="Letöltés elérhető" />
        <Text style={h1}>Itt van a letöltési linked</Text>
        <Text style={paragraph}>Kedves {name || 'Vásárló'}!</Text>
        <Text style={paragraph}>
          {isFree
            ? 'Az ingyenes kiadvány letölthető az alábbi linkre kattintva.'
            : 'A megrendelésed rendezett, a termék letölthető az alábbi linkre kattintva.'}
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
              {isKnowledge ? 'Kiadvány letöltése' : 'Szoftver letöltése'}
            </Button>
          ) : null}
        </Section>
        {!isKnowledge ? <><Text style={notice}>
          {isDemo
            ? 'Ez egy DEMO licenc — korlátozott ideig használható. A letöltés után indítsd el a programot, és a megjelenő '
            : 'A letöltés után indítsd el / nyisd meg a megvásárolt terméket, és a megjelenő '}
          <a
            href="https://xlntbi.hu/api/public/hwid-download"
            style={{ color: '#DC2626', fontWeight: 700, textDecoration: 'underline', fontStyle: 'italic' }}
          >
            HWID-t küldd el
          </a>{' '}
          {isDemo
            ? 'a termék nevével együtt az info@xlntbi.hu e-mail címre, és küldök egy DEMO licenszkódot.'
            : 'a megvásárolt termék nevével és licensz típusával együtt az info@xlntbi.hu emailcímre.'}
        </Text>
        <Section style={{ margin: '0 0 20px' }}>
          <Button href={buildMailto(name, productName, tierLabel, isDemo, demoHwid)} style={button}>
            {isDemo ? 'DEMO licenszet kérek e-mailben' : 'Licenszet kérek e-mailben'}
          </Button>
        </Section></> : null}
        {rows && rows.length > 0 ? <DataTable rows={rows} /> : null}
        {!isKnowledge ? <Text style={paragraph}>
          <strong>Fontos:</strong> a link {expiresAt ? `${expiresAt}-ig` : '14 napig'} él, és
          legfeljebb {maxDownloads ?? 10} alkalommal használható fel. Kérlek, mentsd le a fájlt
          a saját gépedre. Ha lejárt vagy elveszett a link, válaszolj erre a levélre, és küldök
          újat.
        </Text> : null}
        {!isKnowledge ? <Text style={paragraph}>
          A licenc a megrendelésben szereplő csomagra érvényes, továbbadása nem engedélyezett.
          Ha bármiben elakadsz a telepítéssel vagy a használattal, írj bátran.
        </Text> : null}
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
