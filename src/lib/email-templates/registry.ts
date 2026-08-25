import type { ComponentType } from 'react'

import { template as belsoRendelesErtesito } from './belso-rendeles-ertesito'
import { template as belsoUrlapErtesito } from './belso-urlap-ertesito'
import { template as letoltesElerheto } from './letoltes-elerheto'
import { template as licenszKod } from './licensz-kod'
import { template as kapcsolatVisszaigazolas } from './kapcsolat-visszaigazolas'
import { template as konzultacioVisszaigazolas } from './konzultacio-visszaigazolas'
import { template as megrendelesVisszaigazolas } from './megrendeles-visszaigazolas'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  'kapcsolat-visszaigazolas': kapcsolatVisszaigazolas,
  'konzultacio-visszaigazolas': konzultacioVisszaigazolas,
  'belso-urlap-ertesito': belsoUrlapErtesito,
  'megrendeles-visszaigazolas': megrendelesVisszaigazolas,
  'belso-rendeles-ertesito': belsoRendelesErtesito,
  'letoltes-elerheto': letoltesElerheto,
  'licensz-kod': licenszKod,
}
