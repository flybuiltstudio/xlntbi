import * as React from 'react'
import { Body, Button, Container, Head, Html, Preview, Text } from '@react-email/components'

import { Footer, Header } from './parts'
import type { TemplateEntry } from './registry'
import { button, container, h1, main, paragraph, small } from './theme'

interface Props {
  name?: string
  confirmUrl?: string
}

const Email = ({ name, confirmUrl }: Props) => (
  <Html lang="hu" dir="ltr">
    <Head />
    <Preview>Kérlek, erősítsd meg a hírlevél-feliratkozásodat.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header subtitle="Hírlevél – megerősítés" />
        <Text style={h1}>Már csak egy kattintás</Text>
        <Text style={paragraph}>Kedves {name || 'Érdeklődő'}!</Text>
        <Text style={paragraph}>
          Feliratkoztál az xlntbi.hu hírlevelére. Az adatvédelmi szabályok miatt kérlek, erősítsd
          meg, hogy valóban te kérted a leveleket.
        </Text>
        {confirmUrl ? (
          <Button href={confirmUrl} style={button}>
            Feliratkozás megerősítése
          </Button>
        ) : null}
        <Text style={{ ...small, marginTop: '20px' }}>
          Ha nem te kérted, egyszerűen hagyd figyelmen kívül ezt a levelet – megerősítés nélkül
          nem küldünk hírlevelet.
        </Text>
        <Footer />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Erősítsd meg a hírlevél-feliratkozásodat – xlntbi.hu',
  displayName: 'Hírlevél – megerősítő',
  previewData: {
    name: 'Kovács Anna',
    confirmUrl: 'https://xlntbi.hu/hirlevel-megerosites?token=abc123',
  },
} satisfies TemplateEntry
