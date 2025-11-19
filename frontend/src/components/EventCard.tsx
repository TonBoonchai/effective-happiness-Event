import Image from "next/image";
import Link from "next/link";

export type EventItem = {
  _id: string;
  name: string;
  venue: string;
  posterPicture?: string | null;
  price?: number;
};

export default function EventCard({ event }: { event: EventItem }) {
  const href = `/events/${event._id}`;
  return (
    <div className="group flex flex-col p-3">
      {/* Clickable Image */}
      <Link
        href={href}
        className="relative mb-3 w-full overflow-hidden rounded-lg bg-zinc-200 block"
        style={{ aspectRatio: "215/280" }}
      >
        {event.posterPicture ? (
          <Image
            src={event.posterPicture}
            alt={event.name}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-[1.01]"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-500">
            Image
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col">
        {/* Clickable Event Name */}
        <Link href={href}>
          <h3 className="line-clamp-2 text-md font-regular text-[#4A4A4A] hover:underline cursor-pointer">
            {event.name}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-1 text-xs text-[#797979]">
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
        {event.price !== undefined && (
          <div className="mt-1 text-xs font-medium text-[#797979]">
            ฿{event.price.toLocaleString()}
          </div>
        )}
        <div className="mt-3 flex justify-center">
          {/* Clickable View Details Button */}
          <Link href={href}>
            <span className="inline-block rounded-sm bg-[#CAB27A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B69E65] cursor-pointer">
              View details
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
