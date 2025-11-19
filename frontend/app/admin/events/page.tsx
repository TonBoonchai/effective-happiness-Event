"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../src/context/AuthContext";
import { api } from "../../../src/lib/api";
import AddEventForm from "../../../src/components/admin/AddEventForm";
import EditEventForm from "../../../src/components/admin/EditEventForm";
import ExistingEventsList from "../../../src/components/admin/ExistingEventsList";

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

  function handleEventDeleted(eventId: string) {
    setEvents((prev) => prev.filter((e) => e._id !== eventId));
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

      <ExistingEventsList
        events={events}
        onEventDeleted={handleEventDeleted}
        onEditEvent={setEditingEvent}
      />
    </div>
  );
}
