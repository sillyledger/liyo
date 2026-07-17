"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ClaimUsernameForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "error" | "claiming">("idle");
  const [error, setError] = useState<string | null>(null);

  function normalize(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9-]/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const clean = normalize(username);

    if (clean.length < 2) {
      setError("Username needs to be at least 2 characters.");
      return;
    }

    setStatus("checking");
    const supabase = createClient();

    const { data: existing, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", clean)
      .maybeSingle();

    if (checkError) {
      setStatus("error");
      setError(`Check failed: ${checkError.message}`);
      return;
    }

    if (existing) {
      setStatus("error");
      setError("That username is already taken.");
      return;
    }

    setStatus("claiming");

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      username: clean,
      sections: [],
    });

    if (profileError) {
      setStatus("error");
      if (profileError.code === "23505") {
        setError("That username was just taken — try another.");
      } else if (profileError.code === "23514") {
        setError("That username isn't available.");
      } else {
        setError(`Insert failed: ${profileError.message}`);
      }
      return;
    }

    const { error: draftError } = await supabase.from("profile_drafts").insert({
      id: userId,
      sections: [],
    });

    if (draftError) {
      setStatus("error");
      setError(`Draft insert failed: ${draftError.message}`);
      return;
    }

    router.refresh();
  }

  return (
    <div className="w-full max-w-[380px] rounded-[16px] border border-line bg-surface p-8">
      <h1 className="text-[22px] font-bold tracking-[-0.02em] text-fg">
        Claim your shelf
      </h1>
      <p className="mt-2 text-[14px] text-muted">
        This becomes your public link — choose carefully.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <div className="flex items-center rounded-[10px] border border-line-2 bg-bg px-4 py-[10px] focus-within:border-accent">
          <span className="font-mono text-[13px] text-muted-2">liyo.dev/</span>
          <input
            type="text"
            required
            placeholder="you"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 bg-transparent text-[14px] text-fg outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={status === "checking" || status === "claiming"}
          className="rounded-[10px] bg-accent px-4 py-[10px] text-[14px] font-semibold text-accent-fg transition-[background] hover:bg-accent-hover disabled:opacity-60"
        >
          {status === "claiming" ? "Claiming…" : "Claim your shelf"}
        </button>
        {error && <p className="text-[13px] text-coral-text">{error}</p>}
      </form>
    </div>
  );
}
