/** Extracts the playlist ID from a pasted Spotify playlist link, e.g. open.spotify.com/playlist/{id} or open.spotify.com/intl-xx/playlist/{id}. */
export function extractSpotifyPlaylistId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.trim().match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?playlist\/([a-zA-Z0-9]+)/i);
  return match ? match[1] : null;
}

export function spotifyEmbedUrl(playlistId: string): string {
  return `https://open.spotify.com/embed/playlist/${playlistId}`;
}
