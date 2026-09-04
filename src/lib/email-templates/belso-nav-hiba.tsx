import * as React from 'react'
import { Body, Container, Head, Html, Preview, Text } from '@react-email/components'

import { DataTable, Header, type Row } from './parts'
import type { TemplateEntry } from './registry'
import { container, h1, main, paragraph, small } from './theme'

interface Props {
  count?: number
  ranAt?: string
  rows?: Row[]
}

const Email = ({ count, ranAt, rows }: Props) => (
  <Html lang="hu" dir="ltr">
    <Head />
    <Preview>{`NAV elutasítás: ${count ?? 0} számla`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header subtitle="Belső értesítő – xlntbi.hu" />
        <Text style={h1}>A NAV elutasított egy számlát</Text>
        <Text style={paragraph}>
          {`Az Online Számla adatszolgáltatás ${count ?? 0} számla esetében hibára futott. Ellenőrzés ideje: ${
            ranAt ?? ''
          }`}
        </Text>
        {rows && rows.length > 0 ? <DataTable rows={rows} /> : null}
        <Text style={small}>
          Részletek: az admin felület Ellenőrzések → NAV ellenőrzés lapján.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => `NAV elutasítás: ${data['count'] ?? 0} számla`,
  displayName: 'Belső értesítő – NAV elutasítás',
  previewData: {
    count: 1,
    ranAt: '2026. 09. 04. 13:40',
    rows: [
      ['XLNT-20260903-1870 · SDB-2026-36', 'Az adószám érvénytelen.'],
    ] as Row[],
  },
} satisfies TemplateEntry
