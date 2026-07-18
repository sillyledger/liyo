import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClaimUsernameForm } from "@/components/dashboard/claim-username-form";
import { ShelfEditor } from "@/components/dashboard/shelf-editor";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

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
    .select("username, name, bio, location, website, avatar_url, quote, mission, sections, published_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return (
      <DashboardShell>
        <ClaimUsernameForm userId={user.id} />
      </DashboardShell>
    );
  }

  const { data: draft } = await supabase
    .from("profile_drafts")
    .select("name, bio, location, website, avatar_url, quote, mission, sections")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <DashboardShell>
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
            quote: null,
            mission: null,
            sections: [],
          }
        }
        published={profile}
      />
    </DashboardShell>
  );
}
