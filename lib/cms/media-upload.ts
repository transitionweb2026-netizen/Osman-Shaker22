/**
 * Preparing uploads in the browser: real file type from the file's first
 * bytes (the browser-reported type is not trusted), size limits, dimensions
 * and a small WebP thumbnail so the library never loads full-size originals.
 */
import { MEDIA_LIMITS } from "./config";
import type { Label } from "./schema";
import type { PreparedUpload } from "./store/types";

type Sniffed = { kind: "image" | "video"; mimeType: string; extension: string };

export class UploadRejected extends Error {
  constructor(readonly reason: Label) {
    super(reason.en);
  }
}

const ascii = (bytes: Uint8Array, start: number, length: number) =>
  String.fromCharCode(...bytes.slice(start, start + length));

/** Detects the format from the file signature. */
export async function sniff(file: File): Promise<Sniffed | null> {
  const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { kind: "image", mimeType: "image/jpeg", extension: "jpg" };
  if (bytes[0] === 0x89 && ascii(bytes, 1, 3) === "PNG") return { kind: "image", mimeType: "image/png", extension: "png" };
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") return { kind: "image", mimeType: "image/webp", extension: "webp" };
  if (ascii(bytes, 4, 4) === "ftyp") {
    const brand = ascii(bytes, 8, 4);
    if (brand === "avif" || brand === "avis") return { kind: "image", mimeType: "image/avif", extension: "avif" };
    if (["isom", "iso2", "mp41", "mp42", "avc1", "M4V ", "dash"].includes(brand)) {
      return { kind: "video", mimeType: "video/mp4", extension: "mp4" };
    }
  }
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return { kind: "video", mimeType: "video/webm", extension: "webm" };
  }
  return null;
}

const mb = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;

async function canvasToWebp(source: CanvasImageSource, width: number, height: number): Promise<Blob | null> {
  const scale = Math.min(1, MEDIA_LIMITS.thumbnailSize / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/webp", 0.82));
}

async function prepareImage(file: File, sniffed: Sniffed): Promise<PreparedUpload> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new UploadRejected({
      en: "This image could not be read. It may be damaged or in a format this browser cannot open.",
      ar: "تعذّرت قراءة الصورة. قد تكون تالفة أو بصيغة لا يفتحها هذا المتصفح.",
    });
  }
  const thumbnail = await canvasToWebp(bitmap, bitmap.width, bitmap.height);
  const prepared: PreparedUpload = {
    file,
    ...sniffed,
    width: bitmap.width,
    height: bitmap.height,
    durationSeconds: null,
    thumbnail,
  };
  bitmap.close();
  return prepared;
}

async function prepareVideo(file: File, sniffed: Sniffed): Promise<PreparedUpload> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.preload = "metadata";
  video.src = url;
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("metadata"));
    });
    let thumbnail: Blob | null = null;
    try {
      video.currentTime = Math.min(1, (video.duration || 2) / 2);
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
        setTimeout(resolve, 3000);
      });
      thumbnail = await canvasToWebp(video, video.videoWidth || 16, video.videoHeight || 9);
    } catch {
      thumbnail = null;
    }
    return {
      file,
      ...sniffed,
      width: video.videoWidth || null,
      height: video.videoHeight || null,
      durationSeconds: Number.isFinite(video.duration) ? Math.round(video.duration) : null,
      thumbnail,
    };
  } catch {
    throw new UploadRejected({
      en: "This video could not be read. Use an MP4 (H.264) or WebM file.",
      ar: "تعذّرت قراءة الفيديو. استخدم ملف MP4 (H.264) أو WebM.",
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Validates a file and gathers what the upload needs; throws `UploadRejected`. */
export async function prepareUpload(file: File, accept: "image" | "video" | "any" = "any"): Promise<PreparedUpload> {
  const sniffed = await sniff(file);
  if (!sniffed) {
    throw new UploadRejected({
      en: "Unsupported file. Images: JPEG, PNG, WebP or AVIF. Videos: MP4 or WebM.",
      ar: "ملف غير مدعوم. الصور: JPEG أو PNG أو WebP أو AVIF. الفيديو: MP4 أو WebM.",
    });
  }
  if (accept !== "any" && sniffed.kind !== accept) {
    throw new UploadRejected(
      accept === "image"
        ? { en: "Please choose an image file.", ar: "يُرجى اختيار ملف صورة." }
        : { en: "Please choose a video file.", ar: "يُرجى اختيار ملف فيديو." },
    );
  }
  const limit = sniffed.kind === "image" ? MEDIA_LIMITS.imageBytes : MEDIA_LIMITS.videoBytes;
  if (file.size > limit) {
    throw new UploadRejected(
      sniffed.kind === "image"
        ? { en: `Images can be up to ${mb(limit)}.`, ar: `الحد الأقصى لحجم الصورة ${mb(limit)}.` }
        : {
            en: `Videos can be up to ${mb(limit)}. For longer videos, upload to YouTube and paste the link instead.`,
            ar: `الحد الأقصى لحجم الفيديو ${mb(limit)}. للفيديوهات الأطول، ارفعها على يوتيوب والصق الرابط بدلًا من ذلك.`,
          },
    );
  }
  return sniffed.kind === "image" ? prepareImage(file, sniffed) : prepareVideo(file, sniffed);
}

/** PUT-style upload with progress (supabase-js has no progress events). */
export function uploadWithProgress(
  url: string,
  body: Blob,
  headers: Record<string, string>,
  onProgress: (fraction: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", url);
    for (const [name, value] of Object.entries(headers)) request.setRequestHeader(name, value);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else {
        let message = `Upload failed (${request.status}).`;
        try {
          const parsed = JSON.parse(request.responseText);
          message = parsed.message || parsed.error || message;
        } catch {
          /* keep default */
        }
        reject(new Error(message));
      }
    };
    request.onerror = () => reject(new Error("The upload was interrupted. Check the connection and try again."));
    request.send(body);
  });
}

export function formatBytes(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
