import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({ taxNumber: z.string().trim().max(40) });

/**
 * Live NAV (Online Számla) taxpayer check for the order form. Public on
 * purpose: it only forwards a Hungarian tax number to NAV and returns whether
 * it belongs to a valid taxpayer. Never blocks on its own — the answer can be
 * "unknown", in which case the order proceeds.
 */
export const checkNavTax = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { checkNavTaxNumber } = await import("./nav-taxpayer.server");
    const result = await checkNavTaxNumber(data.taxNumber);
    return {
      status: result.status,
      name: result.name ?? null,
      address: result.address ?? null,
    };
  });
