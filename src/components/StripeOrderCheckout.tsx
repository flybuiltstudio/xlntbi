import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { useMemo } from "react";

import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createOrderCheckoutSession } from "@/utils/payments.functions";

type Props = {
  priceId: string;
  quantity: number;
  orderNumber: string;
  customerEmail: string;
  /** Terméknév a saját katalógusból (mindig „XLNT ” előtaggal jelenik meg). */
  productLabel?: string;
};

export function StripeOrderCheckout({
  priceId,
  quantity,
  orderNumber,
  customerEmail,
  productLabel,
}: Props) {
  const options = useMemo(
    () => ({
      fetchClientSecret: async () => {
        const result = await createOrderCheckoutSession({
          data: {
            priceId,
            quantity,
            orderNumber,
            customerEmail,
            returnUrl: `${window.location.origin}/megrendeles/koszonjuk?rendeles=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
            environment: getStripeEnvironment(),
          },
        });
        if ("error" in result) throw new Error(result.error);
        if (!result.clientSecret) throw new Error("A fizetési munkamenet nem jött létre.");
        return result.clientSecret;
      },
    }),
    [priceId, quantity, orderNumber, customerEmail],
  );

  return (
    <div id="checkout" className="mt-6">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
