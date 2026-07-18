import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSectionItems } from "@/lib/sections";
import { workspaceGradient } from "@/lib/workspace-gradient";

const CARD_TAG = "font-mono text-[10px] uppercase tracking-[0.14em] text-muted-2";

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
    .select("username, name, bio, location, website, avatar_url, quote, mission, sections")
    .eq("username", params.username)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const initial = (profile.name || profile.username).charAt(0).toUpperCase();
  const currentFocusItems = getSectionItems(profile.sections, "current_focus");
  const gearItems = getSectionItems(profile.sections, "workspace_gear");
  const hasMissionContent = Boolean(profile.mission) || currentFocusItems.length > 0;
  const hasWorkspaceContent = gearItems.length > 0;
  const hasNothingElse = !hasMissionContent && !hasWorkspaceContent;
  const gradient = workspaceGradient(profile.username);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[760px] flex-col px-6 py-16">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
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

        {profile.quote && (
          <div className="w-full flex-shrink-0 rounded-[16px] border border-line bg-surface p-6 sm:max-w-[280px]">
            <span className="font-serif text-[40px] leading-none text-coral-deep">&ldquo;</span>
            <p className="mt-1 text-[14px] italic leading-[1.55] text-fg">{profile.quote}</p>
            <p className="mt-3 text-[12.5px] text-muted-2">— {profile.name || profile.username}</p>
          </div>
        )}
      </div>

      {profile.bio && (
        <p className="mt-5 max-w-[34em] text-[14.5px] leading-[1.6] text-muted">
          {profile.bio}
        </p>
      )}

      {(profile.location || profile.website) && (
        <div className="mt-3 flex flex-wrap gap-4 text-[13px] text-muted-2">
          {profile.location && <span>{profile.location}</span>}
          {profile.website && (
            <a href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`} target="_blank" rel="noreferrer" className="text-sea-deep hover:underline">{profile.website}</a>
          )}
        </div>
      )}

      {hasMissionContent && (
        <div className="mt-8 w-full rounded-[16px] border border-line bg-surface p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <span className={CARD_TAG}>Mission</span>
              {profile.mission && (
                <p className="mt-2 text-[14px] leading-[1.6] text-muted">{profile.mission}</p>
              )}
            </div>
            {currentFocusItems.length > 0 && (
              <div>
                <span className={CARD_TAG}>Current focus</span>
                <ul className="mt-2 flex flex-col gap-2">
                  {currentFocusItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13.5px] text-fg">
                      <span className="mt-[3px] flex h-[16px] w-[16px] flex-shrink-0 items-center justify-center rounded-full bg-sea text-[10px] text-slate">
                        &#10003;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {hasWorkspaceContent && (
        <div className="mt-4 w-full rounded-[16px] border border-line bg-surface p-6">
          <div
            className="relative h-[88px] w-full overflow-hidden rounded-[12px]"
            style={{ backgroundImage: gradient.backgroundImage }}
          >
            {profile.location && (
              <span className="absolute right-3 top-3 rounded-full bg-slate/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-oatmeal backdrop-blur-sm">
                {profile.location}
              </span>
            )}
          </div>
          <span className={`${CARD_TAG} mt-4 block`}>Workspace</span>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {gearItems.map((item, i) => (
              <span key={i} className="text-[13px] text-muted">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {hasNothingElse && (
        <div className="mt-8 w-full rounded-[16px] border border-line bg-surface px-6 py-10 text-center">
          <p className="text-[15px] font-medium text-fg">
            This shelf is still being built.
          </p>
          <p className="mt-2 text-[13.5px] text-muted-2">
            Check back soon — @{profile.username} is just getting started.
          </p>
        </div>
      )}
    </main>
  );
}
