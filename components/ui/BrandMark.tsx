/**
 * Monogram: an "O" ring blending the brand blue into amber, with an amber
 * point of light in orbit. `idPrefix` keeps gradient ids unique per instance.
 */
export function BrandMark({ idPrefix, size = 40 }: { idPrefix: string; size?: number }) {
  const ring = `${idPrefix}-ring`;
  const core = `${idPrefix}-core`;
  const tile = `${idPrefix}-tile`;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={tile} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#145399" stopOpacity="0.65" />
          <stop offset="1" stopColor="#040d1f" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={ring} x1="0.1" y1="0.1" x2="0.9" y2="0.95">
          <stop offset="0" stopColor="#dbe8f8" />
          <stop offset="0.45" stopColor="#4a8ad6" />
          <stop offset="1" stopColor="#e98435" />
        </linearGradient>
        <radialGradient id={core} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffe2c4" />
          <stop offset="0.5" stopColor="#e98435" />
          <stop offset="1" stopColor="#b85f1c" />
        </radialGradient>
      </defs>
      <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="12" fill={`url(#${tile})`} stroke="rgb(255 255 255 / 0.28)" strokeWidth="1" />
      <circle cx="19.5" cy="20.5" r="9.6" fill="none" stroke={`url(#${ring})`} strokeWidth="3" />
      <circle cx="27.6" cy="12.4" r="3.3" fill={`url(#${core})`} />
    </svg>
  );
}
