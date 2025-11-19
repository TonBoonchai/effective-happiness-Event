"use client";
import { useState } from "react";
import Modal from "../ui/Modal";
import { useAuth } from "../../context/AuthContext";

export default function SignUpModal({
  open,
  onClose,
  onSwitchToSignIn,
}: {
  open: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
}) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ name, tel, email, role, password });
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Sign Up">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm text-zinc-700">Username</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-amber-50/40 px-3 py-2 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-zinc-700">Tel</label>
          <input
            required
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-amber-50/40 px-3 py-2 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-zinc-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-amber-50/40 px-3 py-2 outline-none"
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
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-zinc-700">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-amber-50/40 px-3 py-2 outline-none"
          >
            <option value="member">member</option>
            <option value="admin">admin</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-yellow-700/80 px-4 py-2 font-semibold text-white hover:bg-yellow-700 disabled:opacity-60"
        >
          {loading ? "Signing up…" : "Sign Up"}
        </button>
        <p className="text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="underline decoration-zinc-400 underline-offset-2 hover:text-zinc-800"
          >
            Sign in
          </button>
        </p>
      </form>
    </Modal>
  );
}
