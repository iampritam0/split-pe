/**
 * The cartoon student who drags the login card in from the right (see
 * login.css → .adm-pull). Faces left, walking ahead of the card, with one
 * arm stretched back over the shoulder holding the rope — the rope itself
 * starts at the hand (101, 65 in this viewBox). Legs, the free arm and the
 * forward lean are animated purely in CSS.
 */
export default function PullingStudent() {
  return (
    <svg className="adm-student" viewBox="0 0 120 190" aria-hidden="true">
      <ellipse className="st-shadow" cx="60" cy="184" rx="30" ry="5" fill="rgba(0,0,0,0.35)" />

      <g className="st-body">
        {/* far leg */}
        <g className="st-leg st-leg-a">
          <rect x="50" y="114" width="13" height="58" rx="6" fill="#1e293b" />
          <path d="M45 169h20a4 4 0 0 1 4 4v5H40v-3a6 6 0 0 1 5-6z" fill="#0b1220" />
        </g>
        {/* free arm (behind the body) */}
        <g className="st-arm">
          <path d="M48 74 38 98" stroke="#0e9f6e" strokeWidth="9" strokeLinecap="round" />
          <circle cx="37" cy="100" r="4.5" fill="#f5c9a3" />
        </g>
        {/* backpack */}
        <rect x="66" y="66" width="24" height="44" rx="9" fill="#2563eb" />
        <rect x="70" y="86" width="16" height="14" rx="4" fill="#1d4ed8" />
        <circle cx="78" cy="74" r="2" fill="#93c5fd" />
        {/* hoodie */}
        <path d="M40 76q0-13 14-13h9q13 0 13 13v38q0 7-7 7H47q-7 0-7-7z" fill="#10b981" />
        <path d="M48 66q8 8 16 0" stroke="#059669" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M66 65q-3 22 2 44" stroke="#1e3a8a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {/* near leg */}
        <g className="st-leg st-leg-b">
          <rect x="54" y="114" width="13" height="58" rx="6" fill="#334155" />
          <path d="M49 169h20a4 4 0 0 1 4 4v5H44v-3a6 6 0 0 1 5-6z" fill="#111827" />
        </g>
        {/* neck + head */}
        <rect x="51" y="52" width="11" height="13" rx="4" fill="#e8b38c" />
        <circle cx="56" cy="40" r="17" fill="#f5c9a3" />
        <circle cx="68" cy="42" r="4" fill="#e8b38c" />
        <path d="M39 37q0-22 21-22 17 0 20 17-6-4-13-3 2 9-2 15-4-8-12-8-9 0-14 6z" fill="#1f2937" />
        {/* glasses, eye, nose, smile */}
        <circle cx="47" cy="40" r="5.5" fill="rgba(255,255,255,0.25)" stroke="#0f172a" strokeWidth="1.8" />
        <path d="M52.5 40h11" stroke="#0f172a" strokeWidth="1.6" />
        <circle className="st-eye" cx="46" cy="40" r="1.9" fill="#0f172a" />
        <path d="M41 43l-3 3.5 3.5 0.8" stroke="#c98d63" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M43 50q4 3 9 0" stroke="#7c2d12" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* pulling arm: over the shoulder, back to the rope */}
        <path d="M62 72 82 79" stroke="#059669" strokeWidth="10" strokeLinecap="round" />
        <path d="M82 79 99 67" stroke="#f5c9a3" strokeWidth="7.5" strokeLinecap="round" />
        <circle cx="101" cy="65" r="5.5" fill="#f5c9a3" />
      </g>
    </svg>
  );
}
