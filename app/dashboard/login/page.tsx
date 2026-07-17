"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setStatus(error ? "error" : "sent");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-[380px] rounded-[16px] border border-line bg-surface p-8">
        <h1 className="text-[22px] font-bold tracking-[-0.02em] text-fg">
          Log in to Liyo
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          We&rsquo;ll email you a link — no password needed.
        </p>

        {status === "sent" ? (
          <p className="mt-6 rounded-[10px] border border-line bg-surface-2 p-4 text-[14px] text-fg">
            Check your inbox for <b>{email}</b> — click the link to log in.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-[10px] border border-line-2 bg-bg px-4 py-[10px] text-[14px] text-fg outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-[10px] bg-accent px-4 py-[10px] text-[14px] font-semibold text-accent-fg transition-[background] hover:bg-accent-hover disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send magic link"}
            </button>
            {status === "error" && (
              <p className="text-[13px] text-coral-text">
                Something went wrong — try again.
              </p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
