/** Original translucent cell drawing. Not a photograph and not a third-party asset. */
const VESICLES = [
  { cx: 250, cy: 310, r: 138 },
  { cx: 390, cy: 250, r: 112 },
  { cx: 410, cy: 400, r: 96 },
  { cx: 200, cy: 430, r: 78 },
  { cx: 330, cy: 168, r: 62 },
  { cx: 500, cy: 320, r: 54 },
  { cx: 150, cy: 220, r: 42 },
  { cx: 470, cy: 160, r: 28 },
] as const;

export function CellField() {
  return (
    <figure className="cl-cell" aria-hidden="true">
      <svg viewBox="0 0 640 640" role="img">
        <title>Translucent cell</title>
        <defs>
          <radialGradient id="cl-membrane" cx="38%" cy="34%" r="68%">
            <stop offset="0%" stopColor="#f7fdff" stopOpacity="0.96" />
            <stop offset="48%" stopColor="#b7e7f6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#6eafd4" stopOpacity="0.22" />
          </radialGradient>
          <radialGradient id="cl-nucleus" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#9aebfb" />
            <stop offset="100%" stopColor="#3e6d90" stopOpacity="0.55" />
          </radialGradient>
        </defs>
        {VESICLES.map((vesicle) => (
          <g key={`${vesicle.cx}-${vesicle.cy}`}>
            <circle cx={vesicle.cx} cy={vesicle.cy} r={vesicle.r} fill="url(#cl-membrane)" stroke="#e7f7fc" strokeWidth="8" />
            <circle cx={vesicle.cx - vesicle.r * 0.18} cy={vesicle.cy - vesicle.r * 0.16} r={vesicle.r * 0.62} fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="6" />
          </g>
        ))}
        <circle cx="286" cy="300" r="46" fill="url(#cl-nucleus)" />
        <circle cx="274" cy="288" r="14" fill="#f4fcff" fillOpacity="0.85" />
        <circle cx="392" cy="268" r="22" fill="#9aebfb" fillOpacity="0.55" />
        <circle cx="360" cy="390" r="16" fill="#d7f4fb" />
      </svg>
    </figure>
  );
}
