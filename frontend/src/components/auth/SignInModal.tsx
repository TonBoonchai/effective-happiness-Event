"use client";
import { useState } from "react";
import Modal from "../ui/Modal";
import { useAuth } from "../../context/AuthContext";

export default function SignInModal({
  open,
  onClose,
  onSwitchToSignUp,
}: {
  open: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Sign In">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm text-zinc-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-amber-50/40 px-3 py-2 outline-none"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-zinc-700">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-amber-50/40 px-3 py-2 outline-none"
            placeholder="••••••"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-yellow-700/80 px-4 py-2 font-semibold text-white hover:bg-yellow-700 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
        <p className="text-center text-sm text-zinc-600">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="underline decoration-zinc-400 underline-offset-2 hover:text-zinc-800"
          >
            Sign up
          </button>
        </p>
      </form>
    </Modal>
  );
}
