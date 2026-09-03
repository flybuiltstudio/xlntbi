import * as React from 'react'
import { Body, Container, Head, Hr, Html, Preview, Text } from '@react-email/components'

import { Header } from './parts'
import type { TemplateEntry } from './registry'
import { BRAND, container, hr, main, small } from './theme'

interface Props {
  subject?: string
  html?: string
  unsubscribeUrl?: string
}

/**
 * Newsletter shell. `html` is the admin-written body, already sanitized on the
 * server (src/lib/newsletter-html.ts) before it reaches this template.
 */
const Email = ({ subject, html, unsubscribeUrl }: Props) => (
  <Html lang="hu" dir="ltr">
    <Head />
    <Preview>{subject || 'Hírlevél az xlntbi.hu-tól'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header subtitle="Hírlevél" />
        <div
          style={{ fontSize: '15px', lineHeight: '24px', color: BRAND.ink }}
          dangerouslySetInnerHTML={{ __html: html || '' }}
        />
        <Hr style={hr} />
        <Text style={small}>
          {BRAND.owner} · {BRAND.siteName} · {BRAND.email} · {BRAND.siteUrl}
        </Text>
        <Text style={small}>
          Ezt a levelet azért kaptad, mert feliratkoztál az xlntbi.hu hírlevelére.{' '}
          {unsubscribeUrl ? (
            <a href={unsubscribeUrl} style={{ color: BRAND.green }}>
              Leiratkozás egy kattintással
            </a>
          ) : null}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => String(data['subject'] || 'Hírlevél – xlntbi.hu'),
  displayName: 'Hírlevél',
  previewData: {
    subject: 'Újdonságok a könyvelésben',
    html: '<p>Kedves Olvasó!</p><p>Ebben a hónapban <strong>három</strong> új Excel-eszköz jelent meg.</p>',
    unsubscribeUrl: 'https://xlntbi.hu/leiratkozas?token=abc123',
  },
} satisfies TemplateEntry
