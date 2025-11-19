"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Image from "next/image";

type TicketingRecord = {
  _id: string;
  ticketAmount: number;
  event: {
    _id: string;
    name: string;
    venue: string;
    description?: string;
    availableTicket?: number;
    posterPicture?: string | null;
    eventDate?: string;
    price?: number;
  };
};

export default function MyTicketsList() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<TicketingRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(1);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api<{
          success: boolean;
          data: TicketingRecord[];
          count: number;
        }>("/ticketing");
        if (!ignore) {
          console.log("Ticketing data loaded:", res.data);
          setItems(res.data || []);
        }
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Failed to load tickets");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [user]);

  function startEdit(rec: TicketingRecord) {
    setEditingId(rec._id);
    setEditQty(rec.ticketAmount);
  }
  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: string) {
    const currentRecord = items.find((item) => item._id === id);
    if (!currentRecord) {
      setError("Ticket record not found");
      return;
    }

    const oldQty = currentRecord.ticketAmount;
    const newQty = editQty;
    const qtyDifference = newQty - oldQty;
    const eventPrice = currentRecord.event.price || 0;
    const priceDifference = qtyDifference * eventPrice;

    // Debug logging
    console.log("Debug saveEdit:", {
      oldQty,
      newQty,
      qtyDifference,
      eventPrice,
      priceDifference,
    });

    setUpdating(true);
    setError(null);

    try {
      // Handle wallet adjustment first if there's a price difference
      if (priceDifference !== 0) {
        if (priceDifference > 0) {
          // User increased tickets - deduct money from wallet first
          await api("/wallet/pay", {
            method: "POST",
            body: JSON.stringify({
              amount: priceDifference,
              eventId: currentRecord.event._id,
              ticketingId: id,
              description: `Additional ${qtyDifference} ticket${
                qtyDifference > 1 ? "s" : ""
              } for ${currentRecord.event.name}`,
            }),
          });
        } else {
          // User decreased tickets - process refund first
          await api("/wallet/refund", {
            method: "POST",
            body: JSON.stringify({
              amount: Math.abs(priceDifference),
              userId: user?._id,
              eventId: currentRecord.event._id,
              ticketingId: id,
              description: `Refund for ${Math.abs(qtyDifference)} ticket${
                Math.abs(qtyDifference) > 1 ? "s" : ""
              } from ${currentRecord.event.name}`,
            }),
          });
        }
      }

      // Only update the ticket quantity if payment/refund was successful
      await api(`/ticketing/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ticketAmount: editQty }),
      });

      // Update local state
      setItems((prev) =>
        prev.map((r) => (r._id === id ? { ...r, ticketAmount: editQty } : r))
      );
      setEditingId(null);

      // Show success message with wallet info
      if (priceDifference > 0) {
        alert(
          `Ticket quantity updated! ฿${priceDifference.toLocaleString()} deducted from your wallet.`
        );
      } else if (priceDifference < 0) {
        alert(
          `Ticket quantity updated! ฿${Math.abs(
            priceDifference
          ).toLocaleString()} refunded to your wallet.`
        );
      } else {
        alert("Ticket quantity updated!");
      }
    } catch (e: any) {
      setError(e?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  }

  async function deleteItem(id: string) {
    const recordToDelete = items.find((item) => item._id === id);
    if (!recordToDelete) {
      setError("Ticket record not found");
      return;
    }

    const refundAmount =
      (recordToDelete.event.price || 0) * recordToDelete.ticketAmount;

    if (
      !confirm(
        `Delete this booking?${
          refundAmount > 0
            ? ` You will receive a refund of ฿${refundAmount.toLocaleString()}.`
            : ""
        }`
      )
    ) {
      return;
    }

    setDeletingId(id);
    setError(null);
    try {
      // Delete the ticket
      await api(`/ticketing/${id}`, { method: "DELETE" });

      // Process refund if there's a price
      if (refundAmount > 0) {
        await api("/wallet/refund", {
          method: "POST",
          body: JSON.stringify({
            amount: refundAmount,
            userId: user?._id,
            eventId: recordToDelete.event._id,
            ticketingId: id,
            description: `Full refund for cancelled booking: ${recordToDelete.event.name}`,
          }),
        });
      }

      // Update local state
      setItems((prev) => prev.filter((r) => r._id !== id));

      // Show success message
      if (refundAmount > 0) {
        alert(
          `Booking cancelled! ฿${refundAmount.toLocaleString()} has been refunded to your wallet.`
        );
      } else {
        alert("Booking cancelled!");
      }
    } catch (e: any) {
      setError(e?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  if (!user) {
    return (
      <p className="text-sm text-zinc-600">
        Please sign in to view your bookings.
      </p>
    );
  }
  if (user.role !== "member") {
    return <p className="text-sm text-zinc-600">Only members have bookings.</p>;
  }

  if (loading) {
    return <p className="text-sm text-zinc-600">Loading your tickets…</p>;
  }

  if (!items.length) {
    return <p className="text-sm text-zinc-600">You have no bookings yet.</p>;
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {items.map((rec) => {
        const editing = rec._id === editingId;
        return (
          <div
            key={rec._id}
            className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 md:grid-cols-[200px_1fr]"
          >
            <div className="relative h-40 w-full overflow-hidden rounded-lg bg-zinc-200">
              {rec.event.posterPicture ? (
                <Image
                  src={rec.event.posterPicture}
                  alt={rec.event.name}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px)100vw,200px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-100">
                  <div className="text-center text-zinc-500">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mx-auto mb-2"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    <div className="text-xs">No Image</div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-zinc-800">
                  {rec.event.name}
                </h3>
                <div className="flex items-start gap-2 text-xs text-zinc-600">
                  <span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 1 1 18 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <span className="truncate">{rec.event.venue}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-zinc-600">
                  <span>
                    <svg
                      width="14"
                      height="14"
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
                  {editing ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={editQty}
                        onChange={(e) =>
                          setEditQty(
                            Math.max(1, Math.min(5, Number(e.target.value)))
                          )
                        }
                        className="w-20 rounded border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs"
                      />
                      {rec.event.price && (
                        <span className="text-xs text-zinc-500">
                          @ ฿{rec.event.price.toLocaleString()}/ticket
                          {editQty !== rec.ticketAmount && (
                            <span
                              className={`ml-1 font-semibold ${
                                (editQty - rec.ticketAmount) * rec.event.price >
                                0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              (
                              {(editQty - rec.ticketAmount) * rec.event.price >
                              0
                                ? "-"
                                : "+"}
                              ฿
                              {Math.abs(
                                (editQty - rec.ticketAmount) * rec.event.price
                              ).toLocaleString()}
                              )
                            </span>
                          )}
                        </span>
                      )}
                      <div className="flex gap-1">
                        <button
                          disabled={updating}
                          onClick={() => saveEdit(rec._id)}
                          className="rounded bg-yellow-700/80 px-2 py-1 text-xs font-semibold text-white hover:bg-yellow-700 disabled:opacity-60"
                        >
                          {updating ? "..." : "Save"}
                        </button>
                        <button
                          type="button"
                          disabled={updating}
                          onClick={cancelEdit}
                          className="rounded px-2 py-1 text-xs font-semibold text-zinc-600 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>
                        {rec.ticketAmount}{" "}
                        {rec.ticketAmount === 1 ? "ticket" : "tickets"}
                      </span>
                      {rec.event.price && (
                        <span className="text-zinc-500">
                          • Total: ฿
                          {(
                            rec.event.price * rec.ticketAmount
                          ).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-4 text-xs">
                {!editing && (
                  <button
                    type="button"
                    onClick={() => startEdit(rec)}
                    className="text-yellow-700 hover:underline"
                  >
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  disabled={deletingId === rec._id}
                  onClick={() => deleteItem(rec._id)}
                  className="text-red-600 hover:underline disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
