import type { ReactNode } from "react";
import { CARD_TAG } from "@/lib/styles";
import { extractSpotifyPlaylistId, spotifyEmbedUrl } from "@/lib/spotify";

interface PlaylistCardProps {
  playlistUrl: string | null;
  colSpanClassName: string;
  editButton?: ReactNode;
}

export function PlaylistCard({ playlistUrl, colSpanClassName, editButton }: PlaylistCardProps) {
  const playlistId = extractSpotifyPlaylistId(playlistUrl);

  return (
    <div className={`relative w-full rounded-[16px] border border-line bg-surface p-6 ${colSpanClassName}`}>
      {editButton}
      <span className={CARD_TAG}>Playlist for Work</span>

      {playlistId ? (
        <iframe
          className="mt-3 w-full"
          src={spotifyEmbedUrl(playlistId)}
          height="152"
          style={{ borderRadius: 12 }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      ) : (
        <p className="mt-2 text-[13.5px] italic text-muted-2">No playlist yet.</p>
      )}
    </div>
  );
}
