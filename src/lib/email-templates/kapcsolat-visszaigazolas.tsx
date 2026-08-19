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
    <Preview>Megkaptam az üzenetedet – hamarosan válaszolok.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header subtitle="Kapcsolatfelvétel visszaigazolása" />
        <Text style={h1}>Köszönöm a megkeresésedet!</Text>
        <Text style={paragraph}>Kedves {name || 'Érdeklődő'}!</Text>
        <Text style={paragraph}>
          Az üzenetedet megkaptam és rögzítettem. Munkanapokon jellemzően 24 órán belül
          válaszolok, és felveszem veled a kapcsolatot a részletek egyeztetéséhez.
        </Text>
        {rows && rows.length > 0 ? <DataTable rows={rows} /> : null}
        {message ? (
          <>
            <Text style={paragraph}>
              <strong>A beküldött üzenet:</strong>
            </Text>
            <Text style={paragraph}>{message}</Text>
          </>
        ) : null}
        <Text style={paragraph}>
          Ha időközben bármi eszedbe jut, egyszerűen válaszolj erre a levélre.
        </Text>
        <Footer />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Megkaptam az üzenetedet – EXCELlent',
  displayName: 'Kapcsolatfelvétel – visszaigazoló',
  previewData: {
    name: 'Kovács Anna',
    message: 'Szeretnék árajánlatot kérni a könyvelésre.',
    rows: [
      ['Név', 'Kovács Anna'],
      ['E-mail', 'anna@pelda.hu'],
      ['Telefon', '20/123-4567'],
    ] as Row[],
  },
} satisfies TemplateEntry
