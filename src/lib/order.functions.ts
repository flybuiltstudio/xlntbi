import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const orderSchema = z.object({
  productSlug: z.enum(["nav-online-szamla-letolto", "nav-penztargep-letolto"]),
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
  acceptTerms: z.literal(true),
  acceptPrivacy: z.literal(true),
  acceptWithdrawal: z.literal(true),
  // Honeypot – must stay empty for humans.
  website: z.string().max(0).optional().default(""),
});

export type OrderInput = z.input<typeof orderSchema>;

export const submitOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    const { handleOrder } = await import("./order.server");
    return handleOrder(data);
  });
