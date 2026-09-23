import * as React from 'react'
import { Body, Container, Head, Html, Preview, Text } from '@react-email/components'

import { DataTable, Header, type Row } from './parts'
import type { TemplateEntry } from './registry'
import { container, h1, main, paragraph, small } from './theme'

interface Props {
  /** Human readable run time (Hungarian format). */
  ranAt?: string
  /** One-sentence summary shown above the table. */
  summary?: string
  rows?: Row[]
  /** New findings, one line each. */
  issues?: string[]
}

const Email = ({ ranAt, summary, rows, issues }: Props) => (
  <Html lang="hu" dir="ltr">
    <Head />
    <Preview>{`Biztonsági jelzés – ${summary ?? ''}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header subtitle="Belső értesítő – xlntbi.hu" />
        <Text style={h1}>Biztonsági jelzés</Text>
        <Text style={paragraph}>{`${summary ?? ''} Futás: ${ranAt ?? ''}`}</Text>
        {rows && rows.length > 0 ? <DataTable rows={rows} /> : null}
        {issues && issues.length > 0 ? (
          <>
            <Text style={paragraph}>Új találatok:</Text>
            {issues.map((issue) => (
              <Text key={issue} style={small}>
                {`• ${issue}`}
              </Text>
            ))}
          </>
        ) : null}
        <Text style={small}>
          Ez a napi önellenőrzés az adatbázis- és beállítás-oldali hibákat vizsgálja
          (védelmi szabályok, hozzáférési jogok, tárolók, függvények, időzített feladatok).
          Nem helyettesíti a teljes kódelemzést és a behatolásvizsgálatot. Ugyanarról a
          találatról csak egyszer küldünk levelet.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: () => 'Biztonsági jelzés – xlntbi.hu',
  displayName: 'Belső értesítő – biztonsági önellenőrzés',
  previewData: {
    ranAt: '2026. 09. 24. 4:00',
    summary: '2 új biztonsági találat.',
    rows: [
      ['Új találat', '2'],
      ['Összes nyitott találat', '5'],
    ] as Row[],
    issues: [
      'Nincs bekapcsolva a soralapú védelem (RLS): teszt_tabla',
      'Nyilvános tároló: kepek',
    ],
  },
} satisfies TemplateEntry
