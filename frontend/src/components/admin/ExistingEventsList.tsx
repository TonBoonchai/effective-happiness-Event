"use client";

import { useState } from "react";
import { api } from "../../lib/api";
import Image from "next/image";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";

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

type ExistingEventsListProps = {
  events: EventItem[];
  onEventDeleted: (eventId: string) => void;
  onEditEvent: (event: EventItem) => void;
};

export default function ExistingEventsList({
  events,
  onEventDeleted,
  onEditEvent,
}: ExistingEventsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function deleteEvent(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setDeletingId(id);
    try {
      await api(`/events/${id}`, { method: "DELETE" });
      onEventDeleted(id);
    } catch (e: any) {
      alert(e?.message || "Failed to delete event");
    } finally {
      setDeletingId(null);
    }
  }

  return (
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
            <div className="mb-2 text-xs text-zinc-600">
              <LocationOnIcon /> {ev.venue}
            </div>
            <div className="mb-2 text-xs text-zinc-600">
              <EventIcon /> {new Date(ev.eventDate).toLocaleDateString()}
            </div>
            <div className="mb-3 text-xs text-zinc-600">
              <ConfirmationNumberIcon /> {ev.availableTicket} tickets
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log("Editing event:", ev);
                  console.log("Event ID:", ev._id);
                  onEditEvent(ev);
                }}
                className="flex-1 rounded-lg bg-[#CAB27A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#B69E65]"
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
  );
}
