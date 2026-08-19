import { sendTemplateEmail } from "@/lib/email-templates/send-email";

export type NotifyJob = {
  template: string;
  to: string;
  key: string;
  data: Record<string, unknown>;
  replyTo?: string;
};

/**
 * Sends a batch of transactional emails through Lovable's managed email API.
 * Never throws: a failed send must not break the form submission or order that
 * was already persisted. Returns true when every send was accepted.
 */
export async function sendEmails(jobs: NotifyJob[]): Promise<boolean> {
  const results = await Promise.all(
    jobs.map(async (job) => {
      try {
        const result = await sendTemplateEmail(job.template, job.to, {
          templateData: job.data,
          idempotencyKey: `${job.template}-${job.key}`,
          ...(job.replyTo ? { replyTo: job.replyTo } : {}),
        });
        if (!result.sent) {
          console.warn(`Email skipped (${job.template}): ${result.reason}`);
        }
        return result.sent;
      } catch (error) {
        console.error(
          `Email send failed (${job.template}):`,
          error instanceof Error ? error.message : error,
        );
        return false;
      }
    }),
  );
  return results.every(Boolean);
}
