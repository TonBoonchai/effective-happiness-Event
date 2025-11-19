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

  function validateThaiPhoneNumber(phone: string): boolean {
    // Remove spaces and dashes
    const cleanPhone = phone.replace(/[\s-]/g, "");

    // Thai phone number patterns:
    // 1. Domestic format: 0XXXXXXXXX (10 digits starting with 0)
    // 2. International format: +66XXXXXXXXX (12 chars starting with +66)
    // 3. International without +: 66XXXXXXXXX (11 digits starting with 66)

    const domesticPattern = /^0[0-9]{9}$/;
    const internationalPattern = /^\+66[0-9]{9}$/;
    const internationalWithoutPlusPattern = /^66[0-9]{9}$/;

    return (
      domesticPattern.test(cleanPhone) ||
      internationalPattern.test(cleanPhone) ||
      internationalWithoutPlusPattern.test(cleanPhone)
    );
  }

  function validateName(name: string): string | null {
    if (!name.trim()) {
      return "Username is required";
    }
    if (name.length < 2) {
      return "Username must be at least 2 characters long";
    }
    if (name.length > 50) {
      return "Username must be less than 50 characters";
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return "Username can only contain letters and spaces";
    }
    return null;
  }

  function validateEmail(email: string): string | null {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  }

  function validatePassword(password: string): string | null {
    if (!password) {
      return "Password is required";
    }
    return null;
  }

  function validatePhone(phone: string): string | null {
    if (!phone.trim()) {
      return "Phone number is required";
    }
    if (!validateThaiPhoneNumber(phone)) {
      return "Please enter a valid Thai phone number (e.g., 0812345678 or +66812345678)";
    }
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate all fields
    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const phoneError = validatePhone(tel);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

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
            className="w-full rounded-xl border border-zinc-100 bg-[#E9DCC9]/10 px-3 py-2 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-zinc-700">Phone Number</label>
          <input
            type="tel"
            required
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            placeholder=""
            className="w-full rounded-xl border border-zinc-100 bg-[#E9DCC9]/10 px-3 py-2 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-zinc-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-100 bg-[#E9DCC9]/10 px-3 py-2 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-zinc-700">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-100 bg-[#E9DCC9]/10 px-3 py-2 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-zinc-700">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-zinc-100 bg-[#E9DCC9]/10 px-3 py-2 outline-none"
          >
            <option value="member">member</option>
            <option value="admin">admin</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#CAB27A] px-4 py-2 font-semibold text-white hover:bg-[#B69E65] disabled:opacity-60"
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
