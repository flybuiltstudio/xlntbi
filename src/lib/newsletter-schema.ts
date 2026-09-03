import { z } from "zod";

/** Newsletter delivery modes shown as radio buttons on the admin page. */
export const NEWSLETTER_MODES = [
  {
    id: "own",
    label: "Saját lista + admin levélküldő",
    hint: "A feliratkozók az oldal saját adatbázisában maradnak, a leveleket innen küldöd ki.",
    fields: [] as const,
  },
  {
    id: "mailerlite",
    label: "MailerLite",
    hint: "A feliratkozók a MailerLite listájába is átkerülnek.",
    fields: [
      { key: "apiKey", label: "API-kulcs", secret: true },
      { key: "groupId", label: "Csoport azonosító (nem kötelező)", secret: false },
    ] as const,
  },
  {
    id: "emailoctopus",
    label: "EmailOctopus",
    hint: "API-kulcs és lista-azonosító szükséges.",
    fields: [
      { key: "apiKey", label: "API-kulcs", secret: true },
      { key: "listId", label: "Lista azonosító", secret: false },
    ] as const,
  },
  {
    id: "sender",
    label: "Sender",
    hint: "API-kulcs, opcionálisan csoport azonosító.",
    fields: [
      { key: "apiKey", label: "API-kulcs", secret: true },
      { key: "groupId", label: "Csoport azonosító (nem kötelező)", secret: false },
    ] as const,
  },
  {
    id: "sendpulse",
    label: "SendPulse",
    hint: "API azonosító (ID) és titkos kulcs, valamint a címlista azonosítója.",
    fields: [
      { key: "clientId", label: "API azonosító (ID)", secret: true },
      { key: "clientSecret", label: "API titkos kulcs (Secret)", secret: true },
      { key: "listId", label: "Címlista azonosító", secret: false },
    ] as const,
  },
  {
    id: "brevo",
    label: "Brevo",
    hint: "API-kulcs, opcionálisan a lista azonosítója.",
    fields: [
      { key: "apiKey", label: "API-kulcs", secret: true },
      { key: "listId", label: "Lista azonosító (nem kötelező)", secret: false },
    ] as const,
  },
] as const;

export type NewsletterMode = (typeof NEWSLETTER_MODES)[number]["id"];

export const NEWSLETTER_MODE_IDS = NEWSLETTER_MODES.map((m) => m.id) as [
  NewsletterMode,
  ...NewsletterMode[],
];

/** Providers that can receive subscribers (everything except the own list). */
export const NEWSLETTER_PROVIDERS = NEWSLETTER_MODES.filter((m) => m.id !== "own");

export const subscribeSchema = z.object({
  lastName: z.string().trim().min(2, "A vezetéknév túl rövid.").max(80),
  firstName: z.string().trim().min(2, "A keresztnév túl rövid.").max(80),
  email: z.string().trim().email("Érvényes e-mail címet adj meg.").max(160),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[0-9()#&+*\-=.\s]*$/, "Csak számok és telefonszám-karakterek adhatók meg.")
    .optional()
    .default(""),
  company: z.string().trim().max(160).optional().default(""),
  privacyConsent: z.literal(true, {
    errorMap: () => ({ message: "Az adatkezelési hozzájárulás elfogadása kötelező." }),
  }),
  // Honeypot – must stay empty for humans.
  website: z.string().max(0).optional().default(""),
});

export type SubscribeInput = z.input<typeof subscribeSchema>;

export const campaignSchema = z.object({
  subject: z.string().trim().min(3, "A tárgy túl rövid.").max(160),
  html: z.string().trim().min(10, "A levél szövege túl rövid.").max(200_000),
  testEmail: z.string().trim().email().max(160).optional().or(z.literal("")),
  testOnly: z.boolean().default(false),
});
