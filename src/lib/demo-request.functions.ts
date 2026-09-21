import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const schema = z.object({
  productSlug: z.string().trim().min(2).max(80),
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(30).optional().default(""),
  companyName: z.string().trim().max(160).optional().default(""),
  taxNumber: z.string().trim().max(30).optional().default(""),
  hwid: z.string().trim().max(100).optional().default(""),
  testUntil: z.string().trim().max(20).nullable().optional().default(null),
  website: z.string().max(0).optional().default(""),
  acceptPrivacy: z.literal(true),
});

export const submitDemoRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const request = getRequest();
    const forwarded = request.headers.get("x-forwarded-for") ?? "";
    const ipAddress = forwarded.split(",")[0]?.trim() || "unknown";
    const { requestDemo } = await import("./demo-request.server");
    return requestDemo({
      ...data,
      ipAddress,
      userAgent: (request.headers.get("user-agent") ?? "").slice(0, 500),
    });
  });
