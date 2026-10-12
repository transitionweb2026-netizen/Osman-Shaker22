import { El_Messiri, IBM_Plex_Sans_Arabic, Instrument_Serif, Manrope } from "next/font/google";

// Fonts are downloaded at build time and self-hosted in the static export.

/** Latin display serif (headings). */
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

/** Latin text and interface (variable weight). Also covers Latin text inside Arabic pages. */
export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

/*
 * Arabic fonts are not preloaded: preloading happens per layout, and the
 * English page should not download Arabic font files. On Arabic pages they are
 * requested as soon as the stylesheet applies.
 */

/** Arabic display (headings), variable 400–700. */
export const elMessiri = El_Messiri({
  subsets: ["arabic"],
  variable: "--font-messiri",
  display: "swap",
  preload: false,
});

/** Arabic text and interface. */
export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-arabic",
  display: "swap",
  preload: false,
});

export const fontVariables = [instrumentSerif, manrope, elMessiri, plexArabic]
  .map((font) => font.variable)
  .join(" ");
