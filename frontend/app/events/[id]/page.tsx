import Image from "next/image";
import Link from "next/link";
import BookNow from "../../../src/components/ticketing/BookNow";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

type EventDetail = {
  _id: string;
  name: string;
  description?: string;
  eventDate: string;
  venue: string;
  organizer?: string;
  availableTicket: number;
  posterPicture?: string | null;
  price?: number;
};

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";
}

async function getEventDetail(id: string): Promise<EventDetail | null> {
  try {
    const res = await fetch(`${getApiBase()}/events/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data as EventDetail;
  } catch {
    return null;
  }
}

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  //   console.log(await params);
  const { id } = await params;
  console.log(id, "id");

  if (!true) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-red-600">Invalid event id.</p>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          Back to home
        </Link>
      </div>
    );
  }

  const event = await getEventDetail(id);
  if (!event) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-red-600">Event not found.</p>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          Back to home
        </Link>
      </div>
    );
  }

  const price = event.price;
  const dateText = new Date(event.eventDate).toLocaleDateString();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 ">
      <div className="grid grid-cols-2 gap-6">
        {/* First section - Left side */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="relative mb-6 h-72 w-full overflow-hidden rounded-xl bg-zinc-200 ">
            {event.posterPicture ? (
              <Image
                src={event.posterPicture}
                alt={event.name}
                fill
                className="object-cover"
                sizes="66vw"
              />
            ) : null}
          </div>
          <h1 className="mb-3 text-2xl font-semibold text-zinc-800">
            {event.name}
          </h1>
          {event.description && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {event.description}
            </p>
          )}
        </section>

        {/* Second and Third sections - Right side stacked */}
        <aside className="space-y-6">
          {/* Second section */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="mb-4 text-xl font-semibold text-zinc-800">
              {event.name}
            </h2>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <LocationOnIcon />
                <div>
                  <div className="font-medium">Concert hall</div>
                  <div className="text-zinc-600">{event.venue}</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <EventIcon />
                <div>
                  <div className="font-medium">Date</div>
                  <div className="text-zinc-600">{dateText}</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <AttachMoneyIcon />
                <div>
                  <div className="font-medium">Price</div>
                  <div className="text-zinc-600">
                    {price !== undefined ? `฿${price.toLocaleString()}` : "—"}
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Third section */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="mb-4 text-xl font-semibold text-zinc-800">
              Book now
            </h3>
            <BookNow
              eventId={event._id}
              available={event.availableTicket}
              price={event.price}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
