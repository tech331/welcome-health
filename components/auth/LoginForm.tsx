"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { FieldError, TextField } from "@/components/requests/new-request/fields";

function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.startsWith("/login")) return "/";
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldErrors = {
    email: !email.trim() ? "Enter your email" : undefined,
    password: !password ? "Enter your password" : undefined,
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setAttempted(true);
    setError(null);

    if (fieldErrors.email || fieldErrors.password) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.error || "Invalid email or password");
      }

      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        id="login-email"
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        required
        autoFocus
        error={attempted ? fieldErrors.email : undefined}
      />
      <TextField
        id="login-password"
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        required
        error={attempted ? fieldErrors.password : undefined}
      />

      {error && <FieldError message={error} />}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2d6a4f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#245a42] disabled:opacity-60"
      >
        {submitting && (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        )}
        Sign in
      </button>
    </form>
  );
}
