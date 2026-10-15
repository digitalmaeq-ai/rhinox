import { liquidOf, observe, universalColour, type AcidState } from "../specs/ab-model";

const SCALE = Array.from({ length: 15 }, (_, p) => p);

/** A beaker, the indicator dropper (or pH probe) and the universal colour scale. */
export default function AcidsApparatus({ state }: { state: AcidState }) {
  const o = observe(state);
  const l = liquidOf(state.sample);
  const name = state.label || l.name;
  const markerX = 60 + (o.ph / 14) * 540;
  const meter = state.indicator === "meter";
  const showMarker = o.tested && (state.indicator === "universal" || meter);
  const n = Number(state.dilution) || 0;

  return (
    <svg viewBox="0 0 660 385" role="img" aria-label={`A beaker of ${name}. ${o.conclusion}`} style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <clipPath id="ab-beaker">
          <path d="M240 40 L255 250 Q256 268 274 268 H386 Q404 268 405 250 L420 40 Z" />
        </clipPath>
      </defs>

      <g clipPath="url(#ab-beaker)">
        <rect x="230" y="110" width="200" height="170" fill={o.colour} style={{ transition: "fill 0.5s" }} />
        <rect x="230" y="110" width="200" height="8" fill="#ffffff" opacity="0.35" />
      </g>
      <path d="M240 40 L255 250 Q256 268 274 268 H386 Q404 268 405 250 L420 40" fill="none" stroke="#64748b" strokeWidth="4" strokeLinejoin="round" />
      {[110, 160, 210].map((y) => (
        <line key={y} x1="258" x2="282" y1={y + 30} y2={y + 30} stroke="#94a3b8" strokeWidth="2" />
      ))}
      <text x="330" y="296" textAnchor="middle" fontSize="17" fontWeight="700" fill="#0b1f4a">{name}</text>
      <text x="330" y="316" textAnchor="middle" fontSize="13" fill="#475569">
        {n > 0 ? `Diluted ${Math.pow(10, n).toLocaleString("en")} times` : "Undiluted"}
        {" · "}
        {state.indicator === "none" ? "No indicator" : state.indicator === "meter" ? "pH meter" : `Indicator: ${state.indicator === "methyl" ? "methyl orange" : state.indicator}`}
      </text>

      {/* dropper */}
      {state.indicator !== "none" && !meter && (
        <g>
          <rect x="318" y="6" width="24" height="46" rx="6" fill="#475569" />
          <path d="M324 52 H336 L330 76 Z" fill="#94a3b8" />
          {state.added && <circle cx="330" cy="88" r="4" fill={o.colour === "#dcebfa" ? "#94a3b8" : o.colour} />}
        </g>
      )}
      {/* pH probe */}
      {meter && (
        <g>
          <rect x="344" y="6" width="22" height="150" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="3" transform={state.added ? "translate(0 40)" : "translate(60 0)"} style={{ transition: "transform .4s" }} />
          <rect x="548" y="66" width="86" height="46" rx="8" fill="#0f172a" />
          <text x="591" y="98" textAnchor="middle" fontSize="22" fontWeight="800" fill="#4ade80">{o.readPh ?? "--.-"}</text>
          <text x="591" y="58" textAnchor="middle" fontSize="12" fill="#475569">pH meter</text>
        </g>
      )}

      {/* pH scale */}
      {SCALE.map((p) => (
        <rect key={p} x={60 + (p / 14) * 540 - 18} y="364" width="38.6" height="10" fill={universalColour(p)} rx={p === 0 || p === 14 ? 5 : 0} />
      ))}
      {[0, 7, 14].map((p) => (
        <text key={p} x={60 + (p / 14) * 540} y="358" textAnchor="middle" fontSize="12" fill="#475569">{p}</text>
      ))}
      {showMarker && <path d={`M${markerX} 360 l-7 -10 h14 z`} fill="#0b1f4a" />}
      <text x="20" y="24" fontSize="14" fontWeight="700" fill="#b91c1c">ACID</text>
      <text x="640" y="24" fontSize="14" fontWeight="700" fill="#1d4ed8" textAnchor="end">ALKALI</text>
    </svg>
  );
}
