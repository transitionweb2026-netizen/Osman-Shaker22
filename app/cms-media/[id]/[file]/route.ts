import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { MEDIA_BUCKET, supabaseKey } from "@/lib/cms/config";
import { cmsApiUrl, getPublishedMedia } from "@/lib/cms/published";
import { CMS_IMAGE_WIDTHS } from "@/lib/media";

/**
 * Files uploaded in the CMS, served without a build:
 *   /cms-media/<id>/<width>.webp     a published photo, resized (never upscaled) to WebP
 *   /cms-media/<id>/video.<mp4|webm> a published video (redirect to a signed Storage URL)
 *
 * Only files used by published content are served: the id must be in the
 * published media list, and Storage itself refuses anything else to the
 * publishable key. A file's URL never changes content (new upload = new id),
 * so responses are cached for a year by browsers and CDNs.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const IMAGE_FILE = /^(\d{3,4})\.webp$/;
const VIDEO_FILE = /^video\.(mp4|webm)$/;
const QUALITY = 72;
const YEAR = 31536000;
/** Resized photos, kept on the server between requests (one file per id and width). */
const cacheDir = path.join(os.tmpdir(), "cms-media");

const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

function storage() {
  return createClient(cmsApiUrl(), supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } }).storage.from(
    MEDIA_BUCKET,
  );
}

function webp(body: Uint8Array) {
  return new Response(body as BodyInit, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": `public, max-age=${YEAR}, s-maxage=${YEAR}, immutable`,
    },
  });
}

export async function GET(_request: Request, { params }: RouteContext<"/cms-media/[id]/[file]">) {
  const { id, file } = await params;
  if (!UUID.test(id)) return notFound();
  const media = await getPublishedMedia(id);
  if (!media) return notFound();

  const video = VIDEO_FILE.exec(file);
  if (video) {
    if (media.kind !== "video") return notFound();
    const { data, error } = await storage().createSignedUrl(media.path, 24 * 3600);
    if (error || !data) return new Response("Video unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
    // The signed URL lasts a day; let browsers and CDNs reuse the redirect for an hour.
    return new Response(null, {
      status: 307,
      headers: { Location: data.signedUrl, "Cache-Control": "public, max-age=3600, s-maxage=3600" },
    });
  }

  const image = IMAGE_FILE.exec(file);
  const width = image ? Number(image[1]) : 0;
  if (!image || media.kind !== "image" || !CMS_IMAGE_WIDTHS.includes(width)) return notFound();

  const cached = path.join(cacheDir, `${id}-${width}.webp`);
  try {
    return webp(await readFile(cached));
  } catch {
    // Not resized yet on this server
  }

  const { data, error } = await storage().download(media.path);
  if (error || !data) return new Response("Image unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
  const output = await sharp(Buffer.from(await data.arrayBuffer()))
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 4 })
    .toBuffer();
  try {
    await mkdir(cacheDir, { recursive: true });
    await writeFile(cached, output);
  } catch {
    // Read-only file system: still serve the image
  }
  return webp(output);
}
