import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

import { BRAND, bar, barSub, barTitle, button, container, h1, main, paragraph, small } from './theme'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="hu" dir="ltr">
    <Head />
    <Preview>Új jelszó beállítása – {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={bar}>
          <p style={barTitle}>{siteName}</p>
          <p style={barSub}>Jelszó-visszaállítás</p>
        </div>
        <Heading style={h1}>Új jelszó beállítása</Heading>
        <Text style={paragraph}>
          Jelszó-visszaállítást kértek ehhez a fiókhoz. Az alábbi gombbal
          adhatsz meg új jelszót:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Új jelszó megadása
        </Button>
        <Text style={{ ...paragraph, marginTop: '24px' }}>
          A link biztonsági okokból csak korlátozott ideig érvényes.
        </Text>
        <Text style={small}>
          Ha nem te kérted a visszaállítást, nyugodtan hagyd figyelmen kívül
          ezt a levelet – a jelszavad nem változik meg.
        </Text>
        <Text style={small}>
          {BRAND.siteName} · {BRAND.siteUrl} · {BRAND.email}
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
