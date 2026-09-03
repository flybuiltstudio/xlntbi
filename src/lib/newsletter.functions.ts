import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { subscribeSchema } from "./newsletter-schema";

/** Public newsletter sign-up (double opt-in). */
export const newsletterSubscribe = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => subscribeSchema.parse(data))
  .handler(async ({ data }) => {
    const { subscribe } = await import("./newsletter.server");
    return subscribe({
      lastName: data.lastName,
      firstName: data.firstName,
      email: data.email,
      phone: data.phone ?? "",
      company: data.company ?? "",
      website: data.website ?? "",
    });
  });

const tokenSchema = z.object({ token: z.string().trim().regex(/^[a-f0-9]{16,128}$/) });

export const newsletterConfirm = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { confirmSubscription } = await import("./newsletter.server");
    return confirmSubscription(data.token);
  });

export const newsletterUnsubscribe = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { unsubscribe } = await import("./newsletter.server");
    return unsubscribe(data.token);
  });
