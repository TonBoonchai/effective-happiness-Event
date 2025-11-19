"use client";

import Navbar from "../../src/components/Navbar";
import MyTicketsList from "../../src/components/ticketing/MyTicketsList";
import AdminTicketsList from "../../src/components/admin/AdminTicketsList";
import { useAuth } from "../../src/context/AuthContext";

export default function MyTicketsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <h1 className="mb-6 text-xl font-semibold text-zinc-800">
          {user?.role === "admin" ? "All Bookings" : "My Booking"}
        </h1>
        {user?.role === "admin" ? <AdminTicketsList /> : <MyTicketsList />}
      </section>
    </div>
  );
}
