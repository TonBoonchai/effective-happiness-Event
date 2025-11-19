export default function HeroCarousel() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <div className="relative h-64 w-full overflow-hidden rounded-xl bg-zinc-200 md:h-80">
          {/* Left arrow */}
          <button
            aria-label="Previous"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 text-zinc-700 shadow hover:bg-white"
          >
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
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          {/* Right arrow */}
          <button
            aria-label="Next"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 text-zinc-700 shadow hover:bg-white"
          >
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
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
          {/* Dots */}
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-white/80" />
            <span className="h-2 w-2 rounded-full bg-white/60" />
            <span className="h-2 w-2 rounded-full bg-white/60" />
          </div>
        </div>
      </div>
    </section>
  );
}
