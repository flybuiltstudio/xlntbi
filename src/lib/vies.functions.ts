import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({ taxNumber: z.string().trim().max(40) });

/**
 * Live EU VAT check for the order form. Public on purpose: it only forwards a
 * tax number to the European Commission's VIES service and returns whether it
 * is valid. Never blocks on its own — the answer can be "unknown".
 */
export const checkEuVat = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { euVatPrefix } = await import("./eu-vat");
    const prefix = euVatPrefix(data.taxNumber);
    if (!prefix || prefix === "HU") {
      return { status: "unknown" as const, name: null, address: null };
    }
    const { checkViesVatNumber } = await import("./vies.server");
    const result = await checkViesVatNumber(data.taxNumber);
    return {
      status: result.status,
      name: result.name ?? null,
      address: result.address ?? null,
    };
  });
