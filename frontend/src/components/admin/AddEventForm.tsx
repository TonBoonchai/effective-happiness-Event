"use client";

import { useMemo, useState } from "react";
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
};

export default function AddEventForm({
  onCreated,
}: {
  onCreated?: (e: EventItem) => void;
}) {
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [venue, setVenue] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [availableTicket, setAvailableTicket] = useState<number>(100);
  const [eventDate, setEventDate] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState("");
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

      const res = await api<{ success: boolean; data: EventItem }>("/events", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSuccess("Event created");
      setName("");
      setVenue("");
      setOrganizer("");
      setAvailableTicket(100);
      setEventDate("");
      setPrice("");
      setDescription("");
      setImage(null);
      onCreated?.(res.data);
    } catch (e: any) {
      setError(e?.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm md:grid-cols-2"
    >
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
          <label className="mb-1 block text-sm text-zinc-700">Event Name</label>
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
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-yellow-700/80 px-5 py-2 font-semibold text-white hover:bg-yellow-700 disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create Event"}
        </button>
      </div>
    </form>
  );
}
