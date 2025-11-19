"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../src/context/AuthContext";
import { api } from "../../../src/lib/api";
import AddEventForm from "../../../src/components/admin/AddEventForm";
import EditEventForm from "../../../src/components/admin/EditEventForm";
import Image from "next/image";

type EventItem = {
  _id: string;
  name: string;
  venue: string;
  eventDate: string;
  organizer?: string;
  availableTicket?: number;
  posterPicture?: string | null;
  description?: string;
};

export default function ManageEventsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Guard non-admins
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
    } else if (user.role !== "admin") {
      router.replace("/");
    }
  }, [user, loading, router]);

  // Load events
  async function loadEvents() {
    try {
      const res = await api<{
        success: boolean;
        count: number;
        data: EventItem[];
      }>("/events");
      setEvents(res.data);
    } catch (e) {
      // swallow for now
    }
  }
  useEffect(() => {
    loadEvents();
  }, []);

  async function deleteEvent(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setDeletingId(id);
    try {
      await api(`/events/${id}`, { method: "DELETE" });
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (e: any) {
      alert(e?.message || "Failed to delete event");
    } finally {
      setDeletingId(null);
    }
  }

  function handleEventUpdated(updatedEvent: EventItem) {
    if (!updatedEvent || !updatedEvent._id) {
      console.error("Invalid updated event data");
      return;
    }
    setEvents((prev) =>
      prev.map((e) => (e._id === updatedEvent._id ? updatedEvent : e))
    );
    setEditingEvent(null);
  }

  if (editingEvent) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <EditEventForm
          event={editingEvent}
          onUpdated={handleEventUpdated}
          onCancel={() => setEditingEvent(null)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-800">
        Manage Events
      </h1>

      <AddEventForm onCreated={() => loadEvents()} />

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">
          Existing Events ({events.length})
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => (
            <div
              key={ev._id}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 h-32 w-full overflow-hidden rounded-lg bg-zinc-200">
                {ev.posterPicture ? (
                  <Image
                    src={ev.posterPicture}
                    alt={ev.name}
                    width={300}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-500 text-xs">
                    No Image
                  </div>
                )}
              </div>
              <div className="mb-2 text-sm font-semibold line-clamp-2">
                {ev.name}
              </div>
              <div className="mb-2 text-xs text-zinc-600">📍 {ev.venue}</div>
              <div className="mb-2 text-xs text-zinc-600">
                📅 {new Date(ev.eventDate).toLocaleDateString()}
              </div>
              <div className="mb-3 text-xs text-zinc-600">
                🎫 {ev.availableTicket} tickets
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log("Editing event:", ev);
                    console.log("Event ID:", ev._id);
                    setEditingEvent(ev);
                  }}
                  className="flex-1 rounded-lg bg-yellow-700/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-yellow-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteEvent(ev._id)}
                  disabled={deletingId === ev._id}
                  className="flex-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  {deletingId === ev._id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
        {events.length === 0 && (
          <p className="text-sm text-zinc-600">No events created yet.</p>
        )}
      </section>
    </div>
  );
}
