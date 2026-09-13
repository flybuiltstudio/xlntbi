import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const draftSchema = z.object({
  slug: z.string().min(1),
  nameHu: z.string().min(1),
  nameEn: z.string().min(1),
  introHu: z.string(),
  introEn: z.string(),
  metaTitleHu: z.string(),
  metaDescriptionHu: z.string(),
  metaTitleEn: z.string(),
  metaDescriptionEn: z.string(),
  htmlHu: z.string().min(1),
  scriptHu: z.string(),
  htmlEn: z.string().min(1),
  scriptEn: z.string(),
});

/* ------------------------------------------------------------------ admin */

export const adminListCustomCalculators = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { listCustomCalculators } = await import("./custom-calculators.server");
    return { calculators: await listCustomCalculators() };
  });

export const adminPrepareCustomCalculator = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string().min(1),
        fileName: z.string().min(1),
        content: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { prepareCustomCalculator } = await import("./custom-calculators.server");
    return prepareCustomCalculator(data);
  });

export const adminPublishCustomCalculator = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        draft: draftSchema,
        position: z.number().int().min(0),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { publishCustomCalculator } = await import("./custom-calculators.server");
    return publishCustomCalculator({ ...data, updatedBy: context.userId });
  });

export const adminDeleteCustomCalculator = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { deleteCustomCalculator } = await import("./custom-calculators.server");
    return deleteCustomCalculator(data.slug);
  });

export const adminListCalculatorOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { listCalculatorOrderRows } = await import("./custom-calculators.server");
    return { rows: await listCalculatorOrderRows() };
  });

export const adminSaveCalculatorOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ ids: z.array(z.string().min(1)) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { saveCalculatorOrder } = await import("./custom-calculators.server");
    return saveCalculatorOrder(data.ids, context.userId);
  });

/* ----------------------------------------------------------------- public */

/** Public card list for the calculator index pages (SSR). */
export const getCustomCalculatorCards = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ lang: z.enum(["hu", "en"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { listCustomCalculatorCards } = await import("./custom-calculators.server");
    return { cards: await listCustomCalculatorCards(data.lang) };
  });

/** Public full read of one custom calculator page (SSR). */
export const getCustomCalculator = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ slug: z.string().min(1), lang: z.enum(["hu", "en"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { getCustomCalculator: load } = await import("./custom-calculators.server");
    return load(data.slug, data.lang);
  });
