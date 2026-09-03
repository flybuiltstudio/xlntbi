const clientToken = import.meta.env['VITE_PAYMENTS_CLIENT_TOKEN'] as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
        A bankkártyás fizetés még nincs élesítve, ezért most csak átutalásos megrendelés adható le.
      </div>
    );
  }
  // Test-mode notice removed: the shop is live, customers must not see it.
  return null;
}
