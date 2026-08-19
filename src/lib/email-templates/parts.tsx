import * as React from 'react'
import { Hr, Section, Text } from '@react-email/components'

import { BRAND, bar, barSub, barTitle, hr, small, table, tdCell, thCell } from './theme'

export type Row = [string, string]

export const Header = ({ subtitle }: { subtitle?: string }) => (
  <Section style={bar}>
    <Text style={barTitle}>{BRAND.siteName}</Text>
    <Text style={barSub}>{subtitle ?? 'Perfect Solutions, Automated FUTURE.'}</Text>
  </Section>
)

export const DataTable = ({ rows }: { rows: Row[] }) => (
  <table style={table}>
    <tbody>
      {rows.map(([key, value]) => (
        <tr key={key}>
          <td style={thCell}>{key}</td>
          <td style={tdCell}>
            {String(value)
              .split('\n')
              .map((line, index) => (
                <React.Fragment key={index}>
                  {index > 0 ? <br /> : null}
                  {line}
                </React.Fragment>
              ))}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

export const Footer = () => (
  <>
    <Hr style={hr} />
    <Text style={small}>
      {BRAND.owner} · {BRAND.siteName}
    </Text>
    <Text style={small}>
      {BRAND.phone} · {BRAND.email} · {BRAND.siteUrl}
    </Text>
    <Text style={small}>
      Ezt a levelet azért kaptad, mert űrlapot töltöttél ki vagy megrendelést adtál le az
      xlntbi.hu oldalon.
    </Text>
  </>
)
