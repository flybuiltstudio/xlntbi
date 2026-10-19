import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  adminListFollowups,
  adminSendDemoFeedback,
  adminSendPaymentReminder,
} from "@/lib/admin.functions";

/** Last send time of every follow-up email, keyed like the server stores it. */
export function useFollowupSentAt() {
  const load = useServerFn(adminListFollowups);
  const [sentAt, setSentAt] = useState<Record<string, string>>({});
  useEffect(() => {
    load()
      .then((r) => setSentAt(r.sentAt ?? {}))
      .catch(() => undefined);
  }, [load]);
  const mark = useCallback((key: string, at: string) => {
    setSentAt((prev) => ({ ...prev, [key]: at }));
  }, []);
  return { sentAt, mark };
}

type Props = {
  kind: "demo-feedback" | "payment-reminder";
  id: string;
  label: string;
  recipient: string;
  subject: string;
  paragraphs: string[];
  sentAt?: string | undefined;
  onSent: (key: string, at: string) => void;
  onResult: (message: string, isError: boolean) => void;
};

export function FollowupEmailButton(props: Props) {
  const sendDemo = useServerFn(adminSendDemoFeedback);
  const sendReminder = useServerFn(adminSendPaymentReminder);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onConfirm() {
    setBusy(true);
    try {
      const result =
        props.kind === "demo-feedback"
          ? await sendDemo({ data: { demoId: props.id } })
          : await sendReminder({ data: { orderId: props.id } });
      if (result.ok && result.sentAt) {
        props.onSent(`${props.kind}-${props.id}`, result.sentAt);
        props.onResult(`${props.label} elküldve: ${props.recipient}`, false);
        setOpen(false);
      } else {
        props.onResult(result.error ?? "A levél kiküldése nem sikerült.", true);
      }
    } catch (e) {
      props.onResult(e instanceof Error ? e.message : "A levél kiküldése nem sikerült.", true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20"
        title={
          props.sentAt
            ? `Utoljára elküldve: ${new Date(props.sentAt).toLocaleString("hu-HU")}`
            : undefined
        }
      >
        {props.label}
        {props.sentAt ? ` (küldve: ${new Date(props.sentAt).toLocaleDateString("hu-HU")})` : ""}
      </button>
      <AlertDialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
        <AlertDialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Elküldhetem ezt a levelet?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1 text-sm text-foreground">
                <p>
                  <strong>Címzett:</strong> {props.recipient}
                </p>
                <p>
                  <strong>Tárgy:</strong> {props.subject}
                </p>
                {props.sentAt ? (
                  <p className="text-destructive">
                    Ezt a levelet már elküldted:{" "}
                    {new Date(props.sentAt).toLocaleString("hu-HU")}
                  </p>
                ) : null}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 rounded-md border border-input bg-muted/40 p-4 text-sm">
            {props.paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Mégsem</AlertDialogCancel>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onConfirm()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? "Küldés…" : "Igen, küldés"}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
