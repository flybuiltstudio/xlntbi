import { assertAdmin, getMyRole } from "./admin.server";

type Ctx = { userId: string; claims: Record<string, any> };

export function claimsEmail(context: { claims: Record<string, any> }): string | undefined {
  return typeof context.claims["email"] === "string" ? context.claims["email"] : undefined;
}

/** Admin-only gate. */
export async function gate(context: Ctx) {
  const ok = await assertAdmin(context.userId, claimsEmail(context));
  if (!ok) throw new Error("Nincs jogosultságod ehhez a felülethez.");
}

/** Statistics gate: both `admin` and `user` roles may read stats. */
export async function gateStats(context: Ctx) {
  const role = await getMyRole(context.userId, claimsEmail(context));
  if (!role) throw new Error("Nincs jogosultságod ehhez a felülethez.");
  return role;
}

/** Current caller role (null when not an admin user at all). */
export async function myRole(context: Ctx) {
  return getMyRole(context.userId, claimsEmail(context));
}
