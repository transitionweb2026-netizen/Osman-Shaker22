import bundledVariants from "@/content/media-variants.generated.json";
import cmsVariants from "@/content/media-variants.cms.generated.json";

export type MediaVariant = { width: number; height: number; widths: number[]; color: string };

/**
 * Responsive WebP variants: photos bundled with the code (`npm run images`)
 * and files published from the CMS (`npm run cms:sync`, named `cms-<id>`).
 */
export const mediaVariants: Record<string, MediaVariant> = { ...bundledVariants, ...cmsVariants };

/** The variant name of a `/media/<name>` source, or `null` for other URLs. */
export function mediaName(src: string): string | null {
  return src.startsWith("/media/") ? src.slice("/media/".length) : null;
}

/** A single image URL for social sharing (about 1200px wide). */
export function shareImageUrl(src: string): string {
  const name = mediaName(src);
  const variant = name ? mediaVariants[name] : undefined;
  if (!name || !variant) return src;
  const width = variant.widths.find((w) => w >= 1200) ?? variant.widths.at(-1);
  return `/media/${name}-${width}.webp`;
}
