import { z } from "zod";

import { checkTaxNumber } from "./tax-number";

export const orderSchema = z.object({
  productSlug: z.string().trim().min(2).max(80),
  tierId: z.string().trim().min(1).max(80),
  quantity: z.coerce.number().int().min(1).max(20),
  billingName: z.string().trim().min(2).max(160),
  companyName: z.string().trim().max(160).optional().default(""),
  taxNumber: z.string().trim().max(40).optional().default(""),
  country: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(2).max(20),
  city: z.string().trim().min(2).max(80),
  addressLine: z.string().trim().min(3).max(200),
  email: z.string().trim().email().max(160),
  phone: z
    .string()
    .trim()
    .min(6)
    .max(30)
    .regex(/^[0-9()#&+*\-=.\s]+$/, "Csak számok és telefonszám-karakterek adhatók meg."),
  note: z.string().trim().max(2000).optional().default(""),
  paymentMethod: z.enum(["card", "transfer"]),
  acceptTerms: z.literal(true),
  acceptPrivacy: z.literal(true),
  acceptWithdrawal: z.literal(true),
  // Honeypot – must stay empty for humans.
  website: z.string().max(0).optional().default(""),
});
