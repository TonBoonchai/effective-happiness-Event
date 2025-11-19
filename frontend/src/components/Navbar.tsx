"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import SignInModal from "./auth/SignInModal";
import SignUpModal from "./auth/SignUpModal";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState<null | "signin" | "signup">(null);

  return (
    <header className="w-full bg-[#FBF6EC] backdrop-blur supports-[backdrop-filter]:bg-amber-50/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/file.svg" alt="Logo" width={28} height={28} priority />
          <span className="text-sm font-semibold tracking-wide text-zinc-800">
            Effective Happiness Event
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-zinc-700">Hi, {user.name}</span>
              {user.role === "admin" && (
                <Link
                  href="/admin/events"
                  className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
                >
                  Manage Events
                </Link>
              )}
              <Link
                href="/my-tickets"
                className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
              >
                My Tickets
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setOpen("signin")}
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
            >
              SignIn
            </button>
          )}
        </nav>
      </div>
      {!user && (
        <>
          <SignInModal
            open={open === "signin"}
            onClose={() => setOpen(null)}
            onSwitchToSignUp={() => setOpen("signup")}
            onSignedIn={() => setOpen(null)}
          />
          <SignUpModal
            open={open === "signup"}
            onClose={() => setOpen(null)}
            onSwitchToSignIn={() => setOpen("signin")}
            onSignedUp={() => setOpen(null)}
          />
        </>
      )}
    </header>
  );
}
