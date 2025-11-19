"use client";

import { useMemo, useState, useEffect } from "react";
import { api } from "../../lib/api";

type EventItem = {
  _id: string;
  name: string;
  venue: string;
  eventDate: string;
  organizer?: string;
  availableTicket?: number;
  posterPicture?: string | null;
  description?: string;
  price?: number;
};

export default function EditEventForm({
  event,
  onUpdated,
  onCancel,
}: {
  event: EventItem;
  onUpdated?: (e: EventItem) => void;
  onCancel?: () => void;
}) {
  const [image, setImage] = useState<string | null>(
    event.posterPicture || null
  );
  const [name, setName] = useState(event.name);
  const [venue, setVenue] = useState(event.venue);
  const [organizer, setOrganizer] = useState(event.organizer || "");
  const [availableTicket, setAvailableTicket] = useState<number>(
    event.availableTicket || 100
  );
  const [eventDate, setEventDate] = useState<string>(
    event.eventDate.split("T")[0]
  );

  // Initialize form fields
  const [price, setPrice] = useState<string>((event.price || 0).toString());
  const [description, setDescription] = useState(event.description || "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const minDate = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return setImage(null);
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Debug: Check if event has _id
    console.log("Event object:", event);
    console.log("Event ID:", event._id);

    if (!event._id) {
      setError("Invalid event ID");
      return;
    }

    if (!eventDate || eventDate < minDate) {
      setError("Event date must be today or later");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        description,
        eventDate,
        venue,
        organizer: organizer || "Event Organizer",
        availableTicket: Number(availableTicket) || 0,
        posterPicture: image || undefined,
        price: Number(price) || 0,
      };

      console.log("Updating event with payload:", payload);
      console.log("PUT URL:", `/events/${event._id}`);

      const res = await api<{ success: boolean; data: EventItem }>(
        `/events/${event._id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );

      console.log("Update response:", res);

      if (res.data && res.data._id) {
        setSuccess("Event updated");
        onUpdated?.(res.data);
      } else if (res.success) {
        // Handle case where response is successful but structured differently
        const updatedEvent = { ...event, ...payload };
        setSuccess("Event updated");
        onUpdated?.(updatedEvent);
      } else {
        setError("Invalid response from server");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to update event");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-800">Edit Event</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-zinc-600 hover:text-zinc-800"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-700">
              Event Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onFile}
              className="block w-full text-sm"
            />
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt="preview"
                className="mt-3 h-40 w-full rounded-lg object-cover"
              />
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-700">
              Event Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-200 bg-amber-50/40 px-3 py-2 outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-700">
              Where (Venue)
            </label>
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-200 bg-amber-50/40 px-3 py-2 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-zinc-700">Date</label>
              <input
                type="date"
                min={minDate}
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-200 bg-amber-50/40 px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-700">
                Total Tickets
              </label>
              <input
                type="number"
                min={0}
                value={availableTicket}
                onChange={(e) => setAvailableTicket(Number(e.target.value))}
                required
                className="w-full rounded-xl border border-zinc-200 bg-amber-50/40 px-3 py-2 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-zinc-700">
                Organizer
              </label>
              <input
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-amber-50/40 px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-700">
                Price of booking
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 49.00"
                className="w-full rounded-xl border border-zinc-200 bg-amber-50/40 px-3 py-2 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-700">
              Event Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-zinc-200 bg-amber-50/40 px-3 py-2 outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-yellow-700/80 px-5 py-2 font-semibold text-white hover:bg-yellow-700 disabled:opacity-60"
            >
              {submitting ? "Updating…" : "Update Event"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-zinc-200 px-5 py-2 font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
