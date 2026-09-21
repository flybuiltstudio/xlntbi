import * as React from 'react'
import { Body, Container, Head, Html, Preview, Text } from '@react-email/components'

import { DataTable, Header, type Row } from './parts'
import type { TemplateEntry } from './registry'
import { container, h1, main, paragraph, small } from './theme'

interface Props {
  /** Short report title, e.g. "Heti karbantartás". */
  title?: string
  /** Human readable run time (Hungarian format). */
  ranAt?: string
  /** One-sentence summary shown above the table. */
  summary?: string
  rows?: Row[]
  issues?: string[]
}

const Email = ({ title, ranAt, summary, rows, issues }: Props) => (
  <Html lang="hu" dir="ltr">
    <Head />
    <Preview>{`${title ?? 'Karbantartás'} – ${summary ?? ''}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header subtitle="Belső értesítő – xlntbi.hu" />
        <Text style={h1}>{title ?? 'Karbantartás'}</Text>
        <Text style={paragraph}>{`${summary ?? ''} Futás: ${ranAt ?? ''}`}</Text>
        {rows && rows.length > 0 ? <DataTable rows={rows} /> : null}
        {issues && issues.length > 0 ? (
          <>
            <Text style={paragraph}>Részletek:</Text>
            {issues.map((issue) => (
              <Text key={issue} style={small}>
                {`• ${issue}`}
              </Text>
            ))}
          </>
        ) : null}
        <Text style={small}>
          Ez az értesítő automatikusan készült. Az admin felületen minden érintett tétel
          megtalálható.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `${data['title'] ?? 'Karbantartás'} – xlntbi.hu`,
  displayName: 'Belső értesítő – karbantartás',
  previewData: {
    title: 'Heti karbantartás',
    ranAt: '2026. 09. 27. 02:00',
    summary: '3 lejárt letöltési link lezárva, 1 lejárt kupon letiltva.',
    rows: [
      ['Lezárt DEMO linkek', '2'],
      ['Lezárt éles letöltési linkek', '1'],
      ['Letiltott lejárt kuponok', '1'],
      ['Hivatkozás nélküli fájlok', '0'],
    ] as Row[],
    issues: ['NYARI2026 kupon lejárt, letiltva.'],
  },
} satisfies TemplateEntry
