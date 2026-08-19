export const BRAND = {
  green: '#217346',
  greenDark: '#165433',
  ink: '#16231d',
  muted: '#5b6b63',
  line: '#dfe7e3',
  soft: '#f4f8f6',
  siteName: 'EXCELlent Business Intelligence',
  siteUrl: 'https://xlntbi.hu',
  phone: '20/962-2176',
  email: 'info@xlntbi.hu',
  owner: 'Sarinay Dávid',
}

export const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
  color: BRAND.ink,
  margin: '0',
  padding: '0',
}

export const container = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '24px',
}

export const bar = {
  backgroundColor: BRAND.green,
  borderRadius: '10px',
  padding: '20px 24px',
  marginBottom: '24px',
}

export const barTitle = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 700,
  margin: '0',
}

export const barSub = {
  color: '#d7ece0',
  fontSize: '13px',
  margin: '6px 0 0',
}

export const h1 = {
  fontSize: '22px',
  lineHeight: '30px',
  fontWeight: 700,
  margin: '0 0 12px',
  color: BRAND.ink,
}

export const paragraph = {
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 14px',
  color: BRAND.ink,
}

export const small = {
  fontSize: '13px',
  lineHeight: '20px',
  color: BRAND.muted,
  margin: '0 0 6px',
}

export const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  fontSize: '14px',
  margin: '0 0 20px',
}

export const thCell = {
  border: `1px solid ${BRAND.line}`,
  backgroundColor: BRAND.soft,
  padding: '8px 10px',
  textAlign: 'left' as const,
  fontWeight: 700,
  width: '38%',
  verticalAlign: 'top' as const,
}

export const tdCell = {
  border: `1px solid ${BRAND.line}`,
  padding: '8px 10px',
  verticalAlign: 'top' as const,
}

export const button = {
  backgroundColor: BRAND.green,
  color: '#ffffff',
  borderRadius: '8px',
  padding: '12px 20px',
  fontSize: '15px',
  fontWeight: 700,
  textDecoration: 'none',
  display: 'inline-block',
}

export const hr = {
  border: 'none',
  borderTop: `1px solid ${BRAND.line}`,
  margin: '24px 0 16px',
}
