import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { submissionSchema } from "./contact-schema";

export type SubmissionInput = z.input<typeof submissionSchema>;

export const submitContactForm = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submissionSchema.parse(data))
  .handler(async ({ data }) => {
    const { handleSubmission } = await import("./contact.server");
    return handleSubmission(data);
  });
