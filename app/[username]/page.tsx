import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface ProfilePageProps {
  params: { username: string };
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, name")
    .eq("username", params.username)
    .maybeSingle();

  if (!profile) return {};

  return {
    title: `${profile.name || profile.username} — Liyo`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, name, bio, avatar_url, sections")
    .eq("username", params.username)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const initial = (profile.name || profile.username).charAt(0).toUpperCase();
  const hasSections = Array.isArray(profile.sections) && profile.sections.length > 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[760px] flex-col px-6 py-16">
      <div className="flex items-start gap-5">
        <div className="flex h-[88px] w-[88px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-line-2 bg-gradient-to-br from-surface-2 to-surface font-mono text-[14px] text-muted">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.name || profile.username}
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </div>

        <div className="pt-1">
          <h1 className="text-[24px] font-bold tracking-[-0.015em] text-fg">
            {profile.name || `@${profile.username}`}
          </h1>
          <p className="mt-0.5 text-[13.5px] text-muted">@{profile.username}</p>
        </div>
      </div>

      {profile.bio && (
        <p className="mt-5 max-w-[34em] text-[14.5px] leading-[1.6] text-muted">
          {profile.bio}
        </p>
      )}

      <div className="mt-8 w-full rounded-[16px] border border-line bg-surface px-6 py-10 text-center">
        {hasSections ? (
          <p className="text-[14px] text-muted">
            The full shelf renders here once blocks are wired up.
          </p>
        ) : (
          <>
            <p className="text-[15px] font-medium text-fg">
              This shelf is still being built.
            </p>
            <p className="mt-2 text-[13.5px] text-muted-2">
              Check back soon — @{profile.username} is just getting started.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
