import * as React from 'react'
import { Body, Container, Head, Html, Preview, Text } from '@react-email/components'

import { Footer, Header } from './parts'
import type { TemplateEntry } from './registry'
import { container, main, paragraph } from './theme'

interface Props {
  subject?: string
  paragraphs?: string[]
  headerSubtitle?: string
}

// Owner follow-up (DEMO feedback request / payment reminder). Text is built
// server-side from fixed owner-written copy in src/lib/admin-mail-templates.ts.
const Email = ({ subject, paragraphs, headerSubtitle }: Props) => (
  <Html lang="hu" dir="ltr">
    <Head />
    <Preview>{subject || 'XLNT BI'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header subtitle={headerSubtitle || 'Üzenet'} />
        {(paragraphs ?? []).map((text, i) => (
          <Text key={i} style={paragraph}>
            {text.split('\n').map((line, j) => (
              <React.Fragment key={j}>
                {j > 0 ? <br /> : null}
                {line}
              </React.Fragment>
            ))}
          </Text>
        ))}
        <Footer />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => data['subject'] || 'XLNT BI',
  displayName: 'Követő levél (visszajelzés / fizetési emlékeztető)',
  previewData: {
    subject: 'Fizetési emlékeztető – XLNT-20261019-1234',
    paragraphs: ['Kedves Könyvelő!', 'Termék: XLNT Havi riport\nLicenc típusa: Teljes csomag\nÁr: 74 900 Ft'],
  },
} satisfies TemplateEntry
