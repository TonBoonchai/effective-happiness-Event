import Image from "next/image";
import Link from "next/link";

export type EventItem = {
  _id: string;
  name: string;
  venue: string;
  posterPicture?: string | null;
};

export default function EventCard({ event }: { event: EventItem }) {
  const href = `/events/${event._id}`;
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-3 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-600/40"
    >
      <div className="relative mb-3 h-44 w-full overflow-hidden rounded-lg bg-zinc-200">
        {event.posterPicture ? (
          <Image
            src={event.posterPicture}
            alt={event.name}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-500">
            Image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:underline">
          {event.name}
        </h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-zinc-600">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 1 1 18 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="truncate">{event.venue}</span>
        </div>
        <div className="mt-3">
          <span className="inline-block rounded-full bg-yellow-700/80 px-4 py-1.5 text-xs font-semibold text-white group-hover:bg-yellow-700">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
}
