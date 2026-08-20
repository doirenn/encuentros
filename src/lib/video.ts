export type VideoProvider = "youtube" | "vimeo";

export function parseVideoEmbed(url: string | null | undefined): {
  provider: VideoProvider;
  src: string;
} | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const yt =
    trimmed.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/,
    ) ?? trimmed.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/);
  if (yt?.[1]) {
    return {
      provider: "youtube",
      src: `https://www.youtube.com/embed/${yt[1]}`,
    };
  }

  const vimeo = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo?.[1]) {
    return {
      provider: "vimeo",
      src: `https://player.vimeo.com/video/${vimeo[1]}`,
    };
  }

  return null;
}
