import * as React from 'react'
import { Body, Container, Head, Html, Link, Preview, Text } from '@react-email/components'

import { DataTable, Header, type Row } from './parts'
import type { TemplateEntry } from './registry'
import { container, h1, main, paragraph, small } from './theme'

interface Props {
  label?: string
  senderName?: string
  senderEmail?: string
  rows?: Row[]
}

const Email = ({ label, senderName, senderEmail, rows }: Props) => (
  <Html lang="hu" dir="ltr">
    <Head />
    <Preview>{`Új ${label || 'űrlapbeküldés'}: ${senderName || ''}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header subtitle="Belső értesítő – xlntbi.hu" />
        <Text style={h1}>{`Új ${label || 'űrlapbeküldés'}`}</Text>
        <Text style={paragraph}>
          {senderName || 'Valaki'} űrlapot töltött ki az oldalon. Az adatok:
        </Text>
        {rows && rows.length > 0 ? <DataTable rows={rows} /> : null}
        {senderEmail ? (
          <Text style={paragraph}>
            <Link href={`mailto:${senderEmail}`}>Válasz írása: {senderEmail}</Link>
          </Text>
        ) : null}
        <Text style={small}>A beküldés az adatbázisban is rögzítve van.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => {
    const rows = (data['rows'] as Row[] | undefined) ?? []
    const services = rows.find(([key]) => key === 'Szolgáltatás')?.[1]
    const prefix = services ? `${services} – ` : ''
    return `${prefix}Új ${data['label'] || 'űrlapbeküldés'}: ${data['senderName'] || 'névtelen'}`
  },
  displayName: 'Belső értesítő – űrlapbeküldés',
  previewData: {
    label: 'kapcsolatfelvétel',
    senderName: 'Kovács Anna',
    senderEmail: 'anna@pelda.hu',
    rows: [
      ['Név', 'Kovács Anna'],
      ['E-mail', 'anna@pelda.hu'],
      ['Telefon', '20/123-4567'],
      ['Üzenet', 'Szeretnék árajánlatot kérni.'],
    ] as Row[],
  },
} satisfies TemplateEntry
