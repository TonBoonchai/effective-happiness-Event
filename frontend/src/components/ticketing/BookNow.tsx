"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

export default function BookNow({
  eventId,
  available,
}: {
  eventId: string;
  available: number;
}) {
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const limit = Math.max(0, Math.min(5, available));

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
    try {
      await api("/ticketing", {
        method: "POST",
        body: JSON.stringify({ event: eventId, ticketAmount: qty }),
      });
      setSuccess("Booked successfully");
    } catch (e: any) {
      setError(e?.message || "Booking failed");
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
      {limit === 0 && <p className="text-sm text-red-600">Sold out</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">{success}</p>}
      <button
        disabled={limit === 0}
        onClick={book}
        className="mt-2 rounded-full bg-yellow-700/80 px-8 py-2 font-semibold text-white hover:bg-yellow-700 disabled:opacity-60"
      >
        Book
      </button>
      <p className="text-xs text-zinc-500">
        Max 5 tickets per event. Available: {available}
      </p>
    </div>
  );
}
