import * as React from 'react'
import { Body, Container, Head, Html, Preview, Text } from '@react-email/components'

import { DataTable, Footer, Header, type Row } from './parts'
import type { TemplateEntry } from './registry'
import { container, h1, main, paragraph } from './theme'

interface Props {
  name?: string
  message?: string
  rows?: Row[]
}

const Email = ({ name, message, rows }: Props) => (
  <Html lang="hu" dir="ltr">
    <Head />
    <Preview>Megkaptam a konzultációkérésedet – egyeztetjük az időpontot.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header subtitle="Konzultációkérés visszaigazolása" />
        <Text style={h1}>Megkaptam a konzultációkérésedet</Text>
        <Text style={paragraph}>Kedves {name || 'Érdeklődő'}!</Text>
        <Text style={paragraph}>
          Köszönöm, hogy időpontot kértél. A megadott elérhetőségen és időszakban keresni
          fogom, hogy pontosítsuk a konzultáció idejét és témáját.
        </Text>
        {rows && rows.length > 0 ? <DataTable rows={rows} /> : null}
        {message ? (
          <>
            <Text style={paragraph}>
              <strong>Amit írtál:</strong>
            </Text>
            <Text style={paragraph}>{message}</Text>
          </>
        ) : null}
        <Text style={paragraph}>
          Ha közben változik az elérhetőséged vagy az időpont, válaszolj erre a levélre.
        </Text>
        <Footer />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Megkaptam a konzultációkérésedet – EXCELlent',
  displayName: 'Konzultációkérés – visszaigazoló',
  previewData: {
    name: 'Tóth Péter',
    message: 'Kontrolling riportokról szeretnék beszélni.',
    rows: [
      ['Név', 'Tóth Péter'],
      ['E-mail', 'peter@pelda.hu'],
      ['Telefon', '20/123-4567'],
      ['Hogyan kereshetem', 'Telefonon'],
      ['Mikor kereshetem', 'Este 17:00 után'],
    ] as Row[],
  },
} satisfies TemplateEntry
