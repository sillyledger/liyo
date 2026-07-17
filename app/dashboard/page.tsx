import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClaimUsernameForm } from "@/components/dashboard/claim-username-form";

export default async function DashboardHome() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  async function signOut() {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg px-6">
        <ClaimUsernameForm userId={user.id} />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-[380px] rounded-[16px] border border-line bg-surface p-8 text-center">
        <h1 className="text-[22px] font-bold tracking-[-0.02em] text-fg">
          Welcome, @{profile.username}
        </h1>
        <p className="mt-2 text-[14px] text-muted">{user.email}</p>
        <p className="mt-4 text-[13px] text-muted-2">
          Your public shelf: liyo.dev/{profile.username}
        </p>
        <p className="mt-1 text-[13px] text-muted-2">
          The real editor (blocks, drafts, publish) gets built next.
        </p>
        <form action={signOut} className="mt-6">
          <button
            type="submit"
            className="rounded-[10px] border border-line-2 px-4 py-[9px] text-[14px] font-medium text-fg transition-colors hover:border-fg"
          >
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}
