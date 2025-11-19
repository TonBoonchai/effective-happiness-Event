"use client";

import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "../../lib/stripe";
import { api } from "../../lib/api";
import StripePaymentForm from "./StripePaymentForm";

type TopupFormProps = {
  onSuccess?: () => void;
};

export default function TopupForm({ onSuccess }: TopupFormProps) {
  const [amount, setAmount] = useState<string>("");
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const presetAmounts = [100, 500, 1000, 2000, 5000];

  async function handleAmountSubmit(topupAmount: number) {
    if (topupAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const paymentRes = await api<{
        success: boolean;
        data: { clientSecret: string; paymentIntentId: string };
      }>("/wallet/topup", {
        method: "POST",
        body: JSON.stringify({ amount: topupAmount }),
      });

      setClientSecret(paymentRes.data.clientSecret);
      setPaymentIntentId(paymentRes.data.paymentIntentId);
      setShowPayment(true);
    } catch (e: any) {
      setError(e?.message || "Failed to create payment");
    } finally {
      setLoading(false);
    }
  }

  async function handlePaymentSuccess() {
    if (!paymentIntentId) return;

    try {
      // Confirm the payment on backend
      await api("/wallet/topup/confirm", {
        method: "POST",
        body: JSON.stringify({ paymentIntentId }),
      });

      // Reset form
      setAmount("");
      setShowPayment(false);
      setClientSecret(null);
      setPaymentIntentId(null);

      onSuccess?.();
      alert(`Successfully topped up ฿${amount}`);
    } catch (e: any) {
      setError(e?.message || "Failed to confirm payment");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const topupAmount = parseFloat(amount);
    handleAmountSubmit(topupAmount);
  }

  function handleBackToAmount() {
    setShowPayment(false);
    setClientSecret(null);
    setPaymentIntentId(null);
    setError(null);
  }

  if (showPayment && clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-800">
              Complete Payment
            </h3>
            <button
              onClick={handleBackToAmount}
              className="text-sm text-zinc-600 hover:text-zinc-800"
            >
              ← Back
            </button>
          </div>

          <div className="mb-6 rounded-lg bg-[#E9DCC9] p-4">
            <p className="text-sm font-medium text-zinc-800">
              Amount: ฿{amount}
            </p>
          </div>

          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          <StripePaymentForm
            onSuccess={handlePaymentSuccess}
            onError={(error: string) => setError(error)}
          />
        </div>
      </Elements>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-6 text-lg font-semibold text-zinc-800">
        Top Up Wallet
      </h2>

      <div className="space-y-6">
        {/* Custom Amount Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Custom Amount (THB)
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount..."
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-[#CAB27A] focus:outline-none focus:ring-1 focus:ring-[#CAB27A]"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="w-full rounded-lg bg-[#CAB27A] px-4 py-3 text-sm font-medium text-white hover:bg-[#B69E65] disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {loading
              ? "Creating Payment..."
              : `Proceed to Pay ฿${amount || "0"}`}
          </button>
        </form>

        {/* Payment Methods Info */}
        <div className="border-t border-zinc-100 pt-4">
          <p className="mb-3 text-sm font-medium text-zinc-700">
            Supported Payment Methods:
          </p>
          <div className="flex items-center gap-3">
            <img
              src="/img/topup/visa.png"
              alt="Visa"
              className="h-8 w-auto object-contain rounded-lg"
            />
            <img
              src="/img/topup/mastercard.png"
              alt="Mastercard"
              className="h-8 w-auto object-contain rounded-lg"
            />
            <img
              src="/img/topup/promptpay.jpg"
              alt="PromptPay"
              className="h-8 w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
