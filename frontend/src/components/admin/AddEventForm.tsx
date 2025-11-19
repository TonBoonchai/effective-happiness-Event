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
      className="grid gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:grid-cols-2"
    >
      <div className="space-y-4">
        <div>
          <label className="mb-3 block text-sm font-medium">Event Image</label>
          <div className="relative">
            {image ? (
              <div className="group relative overflow-hidden rounded-xl border-2 border-dashed border-zinc-400">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Event preview"
                  className="h-120 w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex h-full items-center justify-center">
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-zinc-50"
                    >
                      Change Image
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <label
                htmlFor="image-upload"
                className="flex h-120 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 transition-colors hover:border-zinc-400 hover:bg-zinc-100"
              >
                <div className="flex flex-col items-center space-y-2">
                  <svg
                    className="h-10 w-10 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="text-sm font-medium text-zinc-600">
                    Upload Event Image
                  </span>
                </div>
              </label>
            )}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={onFile}
              className="hidden"
            />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">Event Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl border border-zinc-200 bg-[#E9DCC9]/20 px-3 py-2 outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Where (Venue)</label>
          <input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            required
            className="w-full rounded-xl border border-zinc-200 bg-[#E9DCC9]/20 px-3 py-2 outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm">Date</label>
            <input
              type="date"
              min={minDate}
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-200 bg-[#E9DCC9]/20 px-3 py-2 outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Total Tickets</label>
            <input
              type="number"
              min={0}
              value={availableTicket}
              onChange={(e) => setAvailableTicket(Number(e.target.value))}
              required
              className="w-full rounded-xl border border-zinc-200 bg-[#E9DCC9]/20 px-3 py-2 outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm">Organizer</label>
            <input
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-[#E9DCC9]/20 px-3 py-2 outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Price of booking</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 49.00"
              className="w-full rounded-xl border border-zinc-200 bg-[#E9DCC9]/20 px-3 py-2 outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm">Event Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-zinc-200 bg-[#E9DCC9]/20 px-3 py-2 outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-[#CAB27A] px-5 py-2 font-semibold text-white hover:bg-[#B69E65] disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create Event"}
        </button>
      </div>
    </form>
  );
}
