import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const submissionSchema = z.object({
  formType: z.enum(["kapcsolat", "konzultacio"]),
  lastName: z.string().trim().min(2).max(80),
  firstName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  phone: z
    .string()
    .trim()
    .min(6)
    .max(30)
    .regex(/^[0-9()#&+*\-=.\s]+$/, "Csak számok és telefonszám-karakterek adhatók meg."),
  company: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(5).max(4000),
  services: z.array(z.string().trim().max(80)).max(12).default([]),
  contactMethod: z.string().trim().max(80).optional().default(""),
  contactTime: z.array(z.string().trim().max(80)).max(12).default([]),
  privacyConsent: z.literal(true, {
    errorMap: () => ({ message: "Az adatkezelési hozzájárulás elfogadása kötelező." }),
  }),
  // Honeypot – must stay empty for humans.
  website: z.string().max(0).optional().default(""),
});

export type SubmissionInput = z.input<typeof submissionSchema>;

export const submitContactForm = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submissionSchema.parse(data))
  .handler(async ({ data }) => {
    const { handleSubmission } = await import("./contact.server");
    return handleSubmission(data);
  });
