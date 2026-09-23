import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Live self-check result plus the remembered decisions (admin only). */
export const adminSecurityFindings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { listOpenFindings } = await import("./security-selfcheck.server");
    return listOpenFindings();
  });

/** Runs the self-check and stores/emails new findings exactly like the daily job. */
export const adminRunSecurityCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { runSecuritySelfCheck, listOpenFindings } = await import(
      "./security-selfcheck.server"
    );
    await runSecuritySelfCheck();
    return listOpenFindings();
  });

const decisionSchema = z.object({
  decisions: z.record(z.string().min(1).max(200), z.enum(["keep", "fix"])).default({}),
});

/** Applies the automatic fixes plus the decision-gated ones (admin only). */
export const adminSecurityAutofix = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => decisionSchema.parse(data ?? {}))
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { runSecurityAutofix } = await import("./security-selfcheck.server");
    return runSecurityAutofix(data.decisions, (context as any).userId ?? null);
  });

/** Forgets a stored decision, so the next check asks about it again. */
export const adminClearSecurityDecision = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ findingKey: z.string().min(1).max(200) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const { gate } = await import("./admin-gate.server");
    await gate(context as any);
    const { clearDecision, listOpenFindings } = await import("./security-selfcheck.server");
    await clearDecision(data.findingKey);
    return listOpenFindings();
  });
