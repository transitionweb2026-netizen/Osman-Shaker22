import bundledVariants from "@/content/media-variants.generated.json";
import cmsVariants from "@/content/media-variants.cms.generated.json";

export type MediaVariant = { width: number; height: number; widths: number[]; color: string };

/**
 * Responsive WebP variants: photos bundled with the code (`npm run images`)
 * and files published from the CMS (`npm run cms:sync`, named `cms-<id>`).
 */
export const mediaVariants: Record<string, MediaVariant> = { ...bundledVariants, ...cmsVariants };

/** Widths the runtime media route (`/cms-media/<id>/<width>.webp`) produces for CMS photos. */
export const CMS_IMAGE_WIDTHS = [320, 480, 640, 960, 1280, 1600, 1920];

/** Widths offered for a CMS photo whose original is `width` pixels wide (never upscaled). */
export function cmsImageWidths(width?: number): number[] {
  const widths = CMS_IMAGE_WIDTHS.filter((w) => !width || w <= width);
  return widths.length ? widths : [CMS_IMAGE_WIDTHS[0]];
}

/** The variant name of a `/media/<name>` source, or `null` for other URLs. */
export function mediaName(src: string): string | null {
  return src.startsWith("/media/") ? src.slice("/media/".length) : null;
}

/** A single image URL for social sharing (about 1200px wide). */
export function shareImageUrl(src: string, width?: number): string {
  if (src.startsWith("/cms-media/")) {
    const widths = cmsImageWidths(width);
    return `${src}/${widths.find((w) => w >= 1200) ?? widths.at(-1)}.webp`;
  }
  const name = mediaName(src);
  const variant = name ? mediaVariants[name] : undefined;
  if (!name || !variant) return src;
  const fallback = variant.widths.find((w) => w >= 1200) ?? variant.widths.at(-1);
  return `/media/${name}-${fallback}.webp`;
}
