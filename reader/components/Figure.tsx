// Plain <img> (not next/image) so it works for both remote Supabase Storage
// URLs and relative paths from the DB without remote-domain config.
export default function Figure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt?: string;
  caption?: string;
}) {
  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt ?? ""} loading="lazy" className="h-auto w-full" />
      {caption && (
        <figcaption className="px-4 py-2 text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
