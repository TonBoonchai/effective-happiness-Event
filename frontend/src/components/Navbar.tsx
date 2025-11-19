"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import SignInModal from "./auth/SignInModal";
import SignUpModal from "./auth/SignUpModal";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState<null | "signin" | "signup">(null);

  return (
    <header className="fixed w-full bg-[#FBF6EC] z-50">
      <div className="flex">
        {/* LEFT — LOGO */}
        <Link href="/" className="flex items-center gap-2 px-5">
          <Image
            src="/img/favicon.ico"
            alt="Logo"
            width={70}
            height={70}
            priority
          />
        </Link>

        {/* RIGHT — NAVIGATION */}
        <nav className="flex items-center gap-6 ml-auto px-10 text-[#4A4A4A]">
          {user ? (
            <>
              <span className="text-md ">Hi, {user.name}</span>

              {user.role === "admin" && (
                <Link
                  href="/admin/events"
                  className="text-sm font-medium  hover:text-zinc-900"
                >
                  Manage Events
                </Link>
              )}

              <Link
                href="/wallet"
                className="text-sm font-medium  hover:text-zinc-900"
              >
                Wallet
              </Link>

              <Link
                href="/my-tickets"
                className="text-sm font-medium  hover:text-zinc-900"
              >
                My Tickets
              </Link>

              <Link
                onClick={logout}
                className="text-sm font-medium  hover:text-zinc-900"
                href="/"
              >
                <LogoutIcon />
              </Link>
            </>
          ) : (
            <Link
              onClick={() => setOpen("signin")}
              className="text-sm font-medium  hover:text-zinc-900"
              href="/"
            >
              Sign In
              <LoginIcon />
            </Link>
          )}
        </nav>
      </div>
      {!user && (
        <>
          <SignInModal
            open={open === "signin"}
            onClose={() => setOpen(null)}
            onSwitchToSignUp={() => setOpen("signup")}
          />
          <SignUpModal
            open={open === "signup"}
            onClose={() => setOpen(null)}
            onSwitchToSignIn={() => setOpen("signin")}
          />
        </>
      )}
    </header>
  );
}
