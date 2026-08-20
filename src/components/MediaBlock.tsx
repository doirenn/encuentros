import { parseVideoEmbed } from "@/lib/video";

export function MediaBlock({
  coverPath,
  videoUrl,
  title,
}: {
  coverPath: string | null;
  videoUrl: string | null;
  title: string;
}) {
  const embed = parseVideoEmbed(videoUrl);

  if (embed) {
    return (
      <div className="overflow-hidden rounded-card border border-line bg-surface">
        <div className="aspect-[1460/752]">
          <iframe
            src={embed.src}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface">
      <div className="aspect-[1460/752]">
        {coverPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverPath} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">Sin portada</div>
        )}
      </div>
    </div>
  );
}
