"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

export default function BookNow({
  eventId,
  available,
  price,
}: {
  eventId: string;
  available: number;
  price?: number;
}) {
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const limit = Math.max(0, Math.min(5, available));

  const totalPrice = (price || 0) * qty;

  // Fetch wallet balance when component mounts and user is logged in
  useEffect(() => {
    if (user && user.role === "member") {
      fetchWalletBalance();
    }
  }, [user]);

  async function fetchWalletBalance() {
    try {
      const walletRes = await api<{
        success: boolean;
        data: { balance: number };
      }>("/wallet");
      setWalletBalance(walletRes.data.balance);
    } catch (e) {
      // Wallet not found or error, default to 0
      setWalletBalance(0);
    }
  }

  function dec() {
    setQty((q) => Math.max(1, q - 1));
  }
  function inc() {
    setQty((q) => Math.min(limit || 1, q + 1));
  }

  async function book() {
    setError(null);
    setSuccess(null);
    if (!user) {
      setError("Please sign in to book");
      return;
    }
    if (user.role !== "member") {
      setError("Only members can book tickets");
      return;
    }

    // Check wallet balance
    if (totalPrice > walletBalance) {
      setError(
        `Insufficient wallet balance. You have ฿${walletBalance.toLocaleString()}, but need ฿${totalPrice.toLocaleString()}`
      );
      return;
    }

    setLoading(true);
    try {
      // First, create the booking
      const bookingRes = await api<{
        _id: string;
        user: string;
        event: string;
        ticketAmount: number;
      }>("/ticketing", {
        method: "POST",
        body: JSON.stringify({ event: eventId, ticketAmount: qty }),
      });

      const ticketingId = bookingRes._id;

      // Then, process the payment
      await api("/wallet/pay", {
        method: "POST",
        body: JSON.stringify({
          amount: totalPrice,
          eventId,
          ticketingId,
          description: `${qty} ticket${qty > 1 ? "s" : ""} for event`,
        }),
      });

      // Refresh wallet balance
      await fetchWalletBalance();

      setSuccess(
        `Booked successfully! ฿${totalPrice.toLocaleString()} deducted from your wallet.`
      );
    } catch (e: any) {
      setError(e?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <span className="text-zinc-500">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </span>
        <button
          onClick={dec}
          className="h-9 w-9 rounded-full bg-amber-200 text-zinc-700"
        >
          -
        </button>
        <div className="min-w-16 rounded-lg bg-zinc-100 px-6 py-2 text-center text-lg">
          {qty}
        </div>
        <button
          onClick={inc}
          className="h-9 w-9 rounded-full bg-amber-200 text-zinc-700"
        >
          +
        </button>
      </div>
      {price !== undefined && (
        <div className="text-center">
          <p className="text-lg font-semibold text-zinc-800">
            Total: ฿{totalPrice.toLocaleString()}
          </p>
          <p className="text-sm text-zinc-600">
            ฿{price.toLocaleString()} × {qty} ticket{qty !== 1 ? "s" : ""}
          </p>
        </div>
      )}
      {user && user.role === "member" && (
        <div className="text-center">
          <p className="text-sm text-zinc-600">
            Wallet Balance: ฿{walletBalance.toLocaleString()}
          </p>
          {totalPrice > walletBalance && (
            <p className="text-xs text-red-600">
              Insufficient balance (need ฿
              {(totalPrice - walletBalance).toLocaleString()} more)
            </p>
          )}
        </div>
      )}
      {limit === 0 && <p className="text-sm text-red-600">Sold out</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">{success}</p>}
      <button
        disabled={
          limit === 0 ||
          loading ||
          (user?.role === "member" && totalPrice > walletBalance)
        }
        onClick={book}
        className="mt-2 rounded-full bg-yellow-700/80 px-8 py-2 font-semibold text-white hover:bg-yellow-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? "Processing..."
          : price !== undefined
          ? `Book for ฿${totalPrice.toLocaleString()}`
          : "Book"}
      </button>
      <p className="text-xs text-zinc-500">
        Max 5 tickets per event. Available: {available}
      </p>
    </div>
  );
}
