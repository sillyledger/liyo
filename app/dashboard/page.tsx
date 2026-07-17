import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardHome() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  async function signOut() {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-[380px] rounded-[16px] border border-line bg-surface p-8 text-center">
        <h1 className="text-[22px] font-bold tracking-[-0.02em] text-fg">
          You&rsquo;re logged in
        </h1>
        <p className="mt-2 text-[14px] text-muted">{user.email}</p>
        <p className="mt-4 text-[13px] text-muted-2">
          This is a placeholder — the real dashboard (editor, drafts, publish) gets built next.
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
