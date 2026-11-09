/** Original translucent cell drawing. Not a photograph and not a third-party asset. */
export function CellField() {
  return (
    <figure className="cl-cell" aria-hidden="true">
      <svg viewBox="0 0 640 640" role="img">
        <title>Translucent cell</title>
        <defs>
          <radialGradient id="cl-membrane" cx="42%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#f7fdff" stopOpacity="0.95" />
            <stop offset="46%" stopColor="#b7e7f6" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#6eafd4" stopOpacity="0.28" />
          </radialGradient>
          <radialGradient id="cl-nucleus" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#9aebfb" />
            <stop offset="100%" stopColor="#3e6d90" stopOpacity="0.55" />
          </radialGradient>
          <filter id="cl-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>
        <circle cx="330" cy="300" r="168" fill="url(#cl-membrane)" stroke="#d7f4fb" strokeWidth="10" />
        <circle cx="300" cy="286" r="118" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="8" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x = 330 + Math.cos(angle) * 150;
          const y = 300 + Math.sin(angle) * 150;
          return <circle key={i} cx={x} cy={y} r={18 + (i % 3) * 6} fill="#e7f7fc" fillOpacity="0.85" stroke="#9aebfb" />;
        })}
        <circle cx="348" cy="292" r="54" fill="url(#cl-nucleus)" filter="url(#cl-soft)" />
        <circle cx="332" cy="278" r="16" fill="#f4fcff" fillOpacity="0.8" />
        <circle cx="120" cy="150" r="28" fill="#d8f6fc" stroke="#9aebfb" />
        <circle cx="520" cy="120" r="18" fill="#eef8ff" stroke="#9fc1ee" />
        <circle cx="560" cy="430" r="36" fill="#c5e9f6" fillOpacity="0.8" stroke="#ffffff" />
      </svg>
    </figure>
  );
}
