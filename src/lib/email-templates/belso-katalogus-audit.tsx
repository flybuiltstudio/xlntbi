import * as React from 'react'
import { Body, Container, Head, Html, Preview, Text } from '@react-email/components'

import { DataTable, Header, type Row } from './parts'
import type { TemplateEntry } from './registry'
import { container, h1, main, paragraph, small } from './theme'

interface Props {
  environment?: string
  ranAt?: string
  errorCount?: number
  warnCount?: number
  rows?: Row[]
  issues?: string[]
}

const Email = ({ environment, ranAt, errorCount, warnCount, rows, issues }: Props) => (
  <Html lang="hu" dir="ltr">
    <Head />
    <Preview>{`Katalógus audit: ${errorCount ?? 0} hiba (${environment ?? 'live'})`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header subtitle="Belső értesítő – xlntbi.hu" />
        <Text style={h1}>Heti katalógus audit – hibát talált</Text>
        <Text style={paragraph}>
          {`A ${environment === 'sandbox' ? 'teszt' : 'éles'} környezet automatikus ellenőrzése ${
            errorCount ?? 0
          } hibát és ${warnCount ?? 0} figyelmeztetést talált. Futás: ${ranAt ?? ''}`}
        </Text>
        {rows && rows.length > 0 ? <DataTable rows={rows} /> : null}
        {issues && issues.length > 0 ? (
          <>
            <Text style={paragraph}>A talált problémák:</Text>
            {issues.map((issue) => (
              <Text key={issue} style={small}>
                {`• ${issue}`}
              </Text>
            ))}
          </>
        ) : null}
        <Text style={small}>
          Részletek és egy kattintásos javítás: az admin felület Ellenőrzések → Katalógus
          ellenőrzés lapján.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Katalógus audit: ${data['errorCount'] ?? 0} hiba (${data['environment'] ?? 'live'})`,
  displayName: 'Belső értesítő – katalógus audit',
  previewData: {
    environment: 'live',
    ranAt: '2026. 08. 30. 03:00',
    errorCount: 2,
    warnCount: 1,
    rows: [
      ['Környezet', 'live'],
      ['Licenszverziók', '58'],
      ['Hibás licenszverzió', '2'],
      ['Hibás termékfájl', '0'],
    ] as Row[],
    issues: ['XLNT Devizabank – teljes csomag: Nincs ilyen lookup key a Stripe-ban.'],
  },
} satisfies TemplateEntry
