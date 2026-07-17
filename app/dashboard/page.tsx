import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClaimUsernameForm } from "@/components/dashboard/claim-username-form";
import { ShelfEditor } from "@/components/dashboard/shelf-editor";

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
    .select("username, name, bio, location, website, avatar_url, published_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg px-6">
        <ClaimUsernameForm userId={user.id} />
      </main>
    );
  }

  const { data: draft } = await supabase
    .from("profile_drafts")
    .select("name, bio, location, website, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <ShelfEditor
      userId={user.id}
      username={profile.username}
      draft={
        draft ?? {
          name: null,
          bio: null,
          location: null,
          website: null,
          avatar_url: null,
        }
      }
      published={profile}
    />
  );
}
