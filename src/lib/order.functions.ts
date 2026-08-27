import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { orderSchema } from "./order-schema";

export type OrderInput = z.input<typeof orderSchema>;

export const submitOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    const { handleOrder } = await import("./order.server");
    return handleOrder(data);
  });
