"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const elRef = useRef<HTMLDivElement | null>(null);
  if (!elRef.current && typeof document !== "undefined") {
    elRef.current = document.createElement("div");
  }

  useEffect(() => {
    if (!elRef.current || !open) return;
    document.body.appendChild(elRef.current);
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      if (elRef.current?.parentNode)
        elRef.current.parentNode.removeChild(elRef.current);
    };
  }, [open, onClose]);

  if (!open || !elRef.current) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-6">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        {title && (
          <h2 className="mb-5 text-center text-2xl font-semibold text-zinc-700">
            {title}
          </h2>
        )}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded p-1 text-zinc-500 hover:bg-zinc-100"
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
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>,
    elRef.current
  );
}
