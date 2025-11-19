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
    setUpdating(true);
    setError(null);
    try {
      await api(`/ticketing/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ticketAmount: editQty }),
      });
      setItems((prev) =>
        prev.map((r) => (r._id === id ? { ...r, ticketAmount: editQty } : r))
      );
      setEditingId(null);
    } catch (e: any) {
      setError(e?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this booking?")) return;
    setDeletingId(id);
    setError(null);
    try {
      await api(`/ticketing/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((r) => r._id !== id));
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
              ) : null}
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
                    <div className="flex items-center gap-2">
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
                      <button
                        disabled={updating}
                        onClick={() => saveEdit(rec._id)}
                        className="rounded bg-yellow-700/80 px-2 py-1 text-xs font-semibold text-white hover:bg-yellow-700 disabled:opacity-60"
                      >
                        Save
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
                  ) : (
                    <span>
                      {rec.ticketAmount}{" "}
                      {rec.ticketAmount === 1 ? "ticket" : "tickets"}
                    </span>
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
