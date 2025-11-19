"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

type StripePaymentFormProps = {
  onSuccess: () => void;
  onError: (error: string) => void;
};

export default function StripePaymentForm({
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements) {
      onError("Stripe has not loaded yet");
      return;
    }

    setIsLoading(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Return URL after payment
          return_url: `${window.location.origin}/wallet?payment=success`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        onError(result.error.message || "Payment failed");
      } else if (
        result.paymentIntent &&
        result.paymentIntent.status === "succeeded"
      ) {
        onSuccess();
      }
    } catch (error) {
      onError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-zinc-200 p-4">
        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["card", "promptpay"],
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full rounded-xl bg-[#CAB27A] px-4 py-2 font-semibold text-white hover:bg-[#B69E65] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Processing..." : "Complete Payment"}
      </button>
    </form>
  );
}
