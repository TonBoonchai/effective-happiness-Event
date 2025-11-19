import Navbar from "../src/components/Navbar";
import HeroCarousel from "../src/components/HeroCarousel";
import EventCard, { type EventItem } from "../src/components/EventCard";

async function getEvents(): Promise<EventItem[]> {
  try {
    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";
    const res = await fetch(`${base}/events`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch events");
    const json = await res.json();
    return (
      json?.data?.map((e: any) => ({
        _id: e._id,
        name: e.name,
        venue: e.venue,
        posterPicture: e.posterPicture ?? null,
        price: e.price,
      })) ?? []
    );
  } catch (e) {
    // Fallback mock data for local UI work
    return [
      {
        _id: "1",
        name: "Bruno Mars @ Bangkok",
        venue: "Rajamangala National Stadium",
        posterPicture: null,
        price: 2500,
      },
      {
        _id: "2",
        name: "Bruno Mars @ Bangkok",
        venue: "Rajamangala National Stadium",
        posterPicture: null,
        price: 2500,
      },
      {
        _id: "3",
        name: "Bruno Mars @ Bangkok",
        venue: "Rajamangala National Stadium",
        posterPicture: null,
        price: 2500,
      },
      {
        _id: "4",
        name: "Bruno Mars @ Bangkok",
        venue: "Rajamangala National Stadium",
        posterPicture: null,
        price: 2500,
      },
    ];
  }
}

export default async function Home() {
  const events = await getEvents();
  return (
    <div className="min-h-screen font-sans text-[#4A4A4A]">
      <HeroCarousel />

      {/* Cards grid */}
      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          {events.map((e) => {
            console.log("event ", e);
            return <EventCard key={e._id} event={e} />;
          })}
        </div>
      </section>
    </div>
  );
}
