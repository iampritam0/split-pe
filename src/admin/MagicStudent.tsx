/**
 * The cartoon student on the admin sign-in: walks in carrying a bag, bends
 * down to set it on the floor, stands up and throws both arms up — and the
 * login card builds itself beside him (choreography in login.css →
 * .adm-show). Drawn facing left in this viewBox; the <svg> itself is
 * mirrored in CSS so he faces the card on his right. Transform origins in
 * login.css are in these viewBox units (hip 58,116 · shoulders 60,72 / 48,74).
 */
export default function MagicStudent() {
  return (
    <svg className="adm-student" viewBox="0 0 120 190" aria-hidden="true">
      <ellipse className="st-shadow" cx="58" cy="184" rx="30" ry="5" fill="rgba(0,0,0,0.35)" />

      {/* the bag once it's on the floor, with a little sparkle */}
      <g className="st-bag-ground">
        <path d="M23 159v-5q0-3 3-3h8q3 0 3 3v5" stroke="#78350f" strokeWidth="2.5" fill="none" />
        <rect x="14" y="158" width="32" height="22" rx="4" fill="#a16207" />
        <rect x="14" y="166" width="32" height="3" fill="#78350f" />
        <rect x="28" y="164" width="4" height="6" rx="1" fill="#fbbf24" />
      </g>
      <g className="st-sparkles" fill="#fde68a">
        <path d="M18 138l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
        <path d="M38 128l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z" />
        <path d="M48 146l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z" />
      </g>

      <g className="st-body">
        {/* far leg */}
        <g className="st-leg st-leg-a">
          <rect x="50" y="114" width="13" height="58" rx="6" fill="#1e293b" />
          <path d="M45 169h20a4 4 0 0 1 4 4v5H40v-3a6 6 0 0 1 5-6z" fill="#0b1220" />
        </g>
        {/* far arm (behind the body) */}
        <g className="st-arm st-arm-far">
          <path d="M48 74 46 96" stroke="#0e9f6e" strokeWidth="9" strokeLinecap="round" />
          <path d="M46 96 46 109" stroke="#f5c9a3" strokeWidth="7" strokeLinecap="round" />
          <circle cx="46" cy="112" r="4.5" fill="#f5c9a3" />
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
        <path className="st-smile" d="M43 50q4 3 9 0" stroke="#7c2d12" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* near arm, carrying the bag until it's set down */}
        <g className="st-arm st-arm-near">
          <path d="M60 72 61 95" stroke="#059669" strokeWidth="10" strokeLinecap="round" />
          <path d="M61 95 62 109" stroke="#f5c9a3" strokeWidth="7.5" strokeLinecap="round" />
          <g className="st-bag-hand">
            <path d="M57 118v-4q0-3 3-3h4q3 0 3 3v4" stroke="#78350f" strokeWidth="2.5" fill="none" />
            <rect x="47" y="117" width="30" height="20" rx="4" fill="#a16207" />
            <rect x="47" y="124" width="30" height="3" fill="#78350f" />
            <rect x="60" y="122" width="4" height="6" rx="1" fill="#fbbf24" />
          </g>
          <circle cx="62" cy="112" r="5" fill="#f5c9a3" />
        </g>
      </g>
    </svg>
  );
}
