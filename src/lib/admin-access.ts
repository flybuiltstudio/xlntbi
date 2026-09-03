/**
 * Central, role-based access map for every /admin sub-route.
 *
 * Single source of truth for the client-side route guard in
 * src/routes/admin.tsx. Server functions keep their own gates
 * (admin.functions.ts: `gate` = admin only, `gateStats` = admin + user);
 * this map only decides which pages a role may open in the UI.
 *
 * Adding a new admin page? Add its prefix here — otherwise it falls back to
 * admin-only, which is the safe default.
 */

export type AdminRouteRole = "admin" | "user";

type AdminRouteRule = {
  /** Path prefix under /admin. */
  prefix: string;
  /** Roles allowed to open the page. */
  roles: AdminRouteRole[];
};

/** Longest matching prefix wins. */
export const ADMIN_ROUTE_ACCESS: AdminRouteRule[] = [
  { prefix: "/admin/statisztika", roles: ["admin", "user"] },
  { prefix: "/admin/kuponok", roles: ["admin", "user"] },
  { prefix: "/admin/jelszo", roles: ["admin", "user"] },
  { prefix: "/admin/friss-verzio", roles: ["admin"] },
  { prefix: "/admin/szamlazas", roles: ["admin"] },
  { prefix: "/admin/billingo-ellenorzes", roles: ["admin"] },
  { prefix: "/admin/katalogus-ellenorzes", roles: ["admin"] },
  { prefix: "/admin/rendelesi-audit", roles: ["admin"] },
  { prefix: "/admin/fizetes-teszt", roles: ["admin"] },
  { prefix: "/admin/hirlevel", roles: ["admin"] },
  { prefix: "/admin/felhasznalok", roles: ["admin"] },
  // Order list (/admin) — admin only.
  { prefix: "/admin", roles: ["admin"] },
];

/** Landing page each role is redirected to when it lacks access. */
export function adminHomeFor(role: AdminRouteRole): string {
  return role === "admin" ? "/admin" : "/admin/statisztika";
}

function normalize(pathname: string): string {
  const p = pathname.replace(/\/+$/, "");
  return p.length === 0 ? "/" : p;
}

/** True when `role` may open `pathname`. Unknown admin paths are admin-only. */
export function canAccessAdminRoute(role: AdminRouteRole, pathname: string): boolean {
  const path = normalize(pathname);
  const rule = [...ADMIN_ROUTE_ACCESS]
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find((r) => path === r.prefix || path.startsWith(`${r.prefix}/`));
  if (!rule) return role === "admin";
  return rule.roles.includes(role);
}
