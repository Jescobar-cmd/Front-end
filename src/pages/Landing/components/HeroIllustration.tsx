export function HeroIllustration() {
  return (
    <svg
      className="landing-hero__art"
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="heroArtBackground" x1="80" y1="40" x2="720" y2="560" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F7FBFA" />
          <stop offset="1" stopColor="#E5F1EE" />
        </linearGradient>
        <linearGradient id="heroArtScreen" x1="240" y1="190" x2="560" y2="400" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F1F8F6" />
        </linearGradient>
        <linearGradient id="heroArtAccent" x1="240" y1="302" x2="326" y2="328" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F5C47" />
          <stop offset="1" stopColor="#147A5D" />
        </linearGradient>
        <radialGradient id="heroArtGlow" cx="0" cy="0" r="1" gradientTransform="translate(640 120) rotate(90) scale(130)">
          <stop stopColor="#CFE8E0" stopOpacity="0.9" />
          <stop offset="1" stopColor="#CFE8E0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="800" height="600" rx="36" fill="url(#heroArtBackground)" />
      <circle cx="640" cy="120" r="130" fill="url(#heroArtGlow)" />
      <circle cx="140" cy="480" r="92" fill="#D8E7EF" opacity="0.5" />
      <circle cx="700" cy="430" r="54" fill="#0F5C47" opacity="0.07" />

      <g className="hero-art__main">
        <rect x="185" y="432" width="430" height="24" rx="12" fill="#123F57" />
        <rect x="215" y="420" width="370" height="16" rx="8" fill="#1B4E66" />
        <rect x="205" y="170" width="390" height="260" rx="22" fill="#123F57" />
        <rect x="219" y="184" width="362" height="232" rx="15" fill="url(#heroArtScreen)" />
        <rect x="219" y="184" width="362" height="34" rx="15" fill="#FFFFFF" />
        <rect x="219" y="203" width="362" height="15" fill="#FFFFFF" />
        <circle cx="239" cy="201" r="4" fill="#E6A6A1" />
        <circle cx="253" cy="201" r="4" fill="#F2C66D" />
        <circle cx="267" cy="201" r="4" fill="#8FCFB7" />
        <rect x="288" y="195" width="150" height="12" rx="6" fill="#EEF5F3" />

        <rect x="240" y="238" width="128" height="10" rx="5" fill="#123F57" />
        <rect x="240" y="258" width="96" height="8" rx="4" fill="#B8D3CB" />
        <rect x="240" y="276" width="112" height="8" rx="4" fill="#D8E7EF" />
        <rect x="240" y="302" width="86" height="26" rx="13" fill="url(#heroArtAccent)" />
        <rect x="392" y="238" width="150" height="90" rx="14" fill="#D8E7EF" />
        <path d="M410 312L448 270L476 298L502 262L524 312H410Z" fill="#8FCFB7" opacity="0.8" />
        <circle cx="504" cy="258" r="10" fill="#F2C66D" />

        <rect x="240" y="346" width="100" height="48" rx="10" fill="#F3F8F6" />
        <circle cx="258" cy="362" r="8" fill="#8FCFB7" />
        <rect x="274" y="356" width="45" height="6" rx="3" fill="#B8D3CB" />
        <rect x="274" y="368" width="30" height="5" rx="2.5" fill="#D8E7EF" />

        <rect x="352" y="346" width="100" height="48" rx="10" fill="#F3F8F6" />
        <circle cx="370" cy="362" r="8" fill="#8FCFB7" opacity="0.75" />
        <rect x="386" y="356" width="40" height="6" rx="3" fill="#B8D3CB" />
        <rect x="386" y="368" width="26" height="5" rx="2.5" fill="#D8E7EF" />

        <rect x="464" y="346" width="78" height="48" rx="10" fill="#0F5C47" opacity="0.12" />
        <rect x="478" y="358" width="34" height="6" rx="3" fill="#0F5C47" opacity="0.5" />
        <rect x="478" y="370" width="22" height="5" rx="2.5" fill="#0F5C47" opacity="0.3" />
      </g>

      <g className="hero-art__float hero-art__float--one">
        <rect x="88" y="138" width="168" height="118" rx="18" fill="#FFFFFF" />
        <circle cx="116" cy="170" r="16" fill="#D8E7EF" />
        <path d="M108 176C108 170.5 111.6 166 116 166C120.4 166 124 170.5 124 176" fill="#165A7D" opacity="0.8" />
        <circle cx="116" cy="166" r="5" fill="#165A7D" opacity="0.8" />
        <rect x="142" y="160" width="70" height="8" rx="4" fill="#123F57" opacity="0.82" />
        <rect x="142" y="176" width="48" height="6" rx="3" fill="#B8D3CB" />
        <rect x="108" y="202" width="128" height="8" rx="4" fill="#D8E7EF" />
        <rect x="108" y="220" width="84" height="8" rx="4" fill="#D8E7EF" />
        <rect x="108" y="238" width="52" height="8" rx="4" fill="#8FCFB7" />
      </g>

      <g className="hero-art__float hero-art__float--two">
        <rect x="585" y="394" width="132" height="104" rx="18" fill="#FFFFFF" />
        <circle cx="614" cy="424" r="14" fill="#F2C66D" opacity="0.9" />
        <path d="M614 416L617.1 421.2L623 422.2L618.8 426.4L619.8 432.3L614 429.3L608.2 432.3L609.2 426.4L605 422.2L610.9 421.2L614 416Z" fill="#FFFFFF" />
        <rect x="638" y="416" width="52" height="7" rx="3.5" fill="#123F57" opacity="0.8" />
        <rect x="638" y="430" width="36" height="6" rx="3" fill="#B8D3CB" />
        <rect x="604" y="454" width="90" height="7" rx="3.5" fill="#D8E7EF" />
        <rect x="604" y="470" width="62" height="7" rx="3.5" fill="#D8E7EF" />
      </g>

      <circle cx="690" cy="248" r="6" fill="#0F5C47" opacity="0.35" />
      <circle cx="118" cy="330" r="5" fill="#165A7D" opacity="0.3" />
      <path d="M668 300L671 307L678 310L671 313L668 320L665 313L658 310L665 307L668 300Z" fill="#8FCFB7" opacity="0.85" />
    </svg>
  );
}
