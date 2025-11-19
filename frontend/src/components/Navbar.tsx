"use client";

import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full border-b border-zinc-200 bg-amber-50/60 backdrop-blur supports-[backdrop-filter]:bg-amber-50/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/file.svg" alt="Logo" width={28} height={28} priority />
          <span className="text-sm font-semibold tracking-wide text-zinc-800">
            Effective Happiness Event
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/signin"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
          >
            SignIn
          </Link>
        </nav>
      </div>
    </header>
  );
}
