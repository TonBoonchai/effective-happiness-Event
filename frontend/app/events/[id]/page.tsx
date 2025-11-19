import Image from "next/image";
import Link from "next/link";
import BookNow from "../../../src/components/ticketing/BookNow";

type EventDetail = {
  _id: string;
  name: string;
  description?: string;
  eventDate: string;
  venue: string;
  organizer?: string;
  availableTicket: number;
  posterPicture?: string | null;
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

function extractPrice(desc?: string): string | null {
  if (!desc) return null;
  const m = desc.match(/price\s*:\s*([^\n]+)/i);
  return m ? m[1].trim() : null;
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
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-zinc-700 underline"
        >
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
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-zinc-700 underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const price = extractPrice(event.description);
  const dateText = new Date(event.eventDate).toLocaleDateString();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="relative mb-6 h-72 w-full overflow-hidden rounded-xl bg-zinc-200 md:h-96">
            {event.posterPicture ? (
              <Image
                src={event.posterPicture}
                alt={event.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 66vw"
              />
            ) : null}
          </div>
          <h1 className="mb-3 text-2xl font-semibold text-zinc-800">
            {event.name}
          </h1>
          {event.description && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
              {event.description}
            </p>
          )}
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="mb-4 text-xl font-semibold text-zinc-800">
              {event.name}
            </h2>
            <ul className="space-y-4 text-sm text-zinc-700">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-zinc-500">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 21v-4a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v4" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <div>
                  <div className="font-medium">Concert hall</div>
                  <div className="text-zinc-600">{event.venue}</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-zinc-500">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M16 2v4" />
                    <path d="M8 2v4" />
                    <path d="M3 10h18" />
                  </svg>
                </span>
                <div>
                  <div className="font-medium">Date</div>
                  <div className="text-zinc-600">{dateText}</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-zinc-500">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" x2="12" y1="1" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </span>
                <div>
                  <div className="font-medium">Price</div>
                  <div className="text-zinc-600">{price ?? "—"}</div>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="mb-4 text-xl font-semibold text-zinc-800">
              Book now
            </h3>
            <BookNow eventId={event._id} available={event.availableTicket} />
          </div>
        </aside>
      </div>
    </div>
  );
}
