import { foodOf, observe, testOf, type FoodState } from "../specs/food-model";

/**
 * Two test tubes: the sample before the test, and the tube after the
 * reagent (in a water bath when Benedict's is heated). A dropper shows the
 * reagent; emulsions go cloudy.
 */
export default function FoodApparatus({ state }: { state: FoodState }) {
  const o = observe(state);
  const f = foodOf(state.food);
  const t = testOf(state.test);
  const heating = state.test === "benedict" && state.heat && state.added;
  const cloudy = state.test === "emulsion" && state.added && o.level > 0;
  const name = state.label || f.name;

  const tube = (x: number, colour: string, opacity = 0.95, y = 0) => (
    <g transform={`translate(0 ${y})`}>
      <path d={`M${x - 36} 90 V250 Q${x - 36} 288 ${x} 288 Q${x + 36} 288 ${x + 36} 250 V90`} fill="#f8fbff" stroke="#64748b" strokeWidth="4" />
      <path d={`M${x - 34} 160 V250 Q${x - 34} 286 ${x} 286 Q${x + 34} 286 ${x + 34} 250 V160 Z`} fill={colour} opacity={opacity} style={{ transition: "fill .6s" }} />
    </g>
  );

  return (
    <svg viewBox="0 0 660 380" role="img" aria-label={`Test tubes: ${name} before the test and after adding ${t.reagent}. ${o.text}`} style={{ width: "100%", height: "100%", display: "block" }}>
      <text x="150" y="44" textAnchor="middle" fontSize="15" fontWeight="700" fill="#0b1f4a">{name}</text>
      <text x="510" y="44" textAnchor="middle" fontSize="15" fontWeight="700" fill="#0b1f4a">After the test</text>
      {tube(150, f.colour, 0.95)}

      {/* water bath */}
      {heating && (
        <g>
          <rect x="430" y="210" width="160" height="110" rx="10" fill="#bfe3f7" fillOpacity="0.7" stroke="#64748b" strokeWidth="3" />
          <path d="M440 330 q10 -10 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#f97316" strokeWidth="4" fill="none" />
          <text x="510" y="352" textAnchor="middle" fontSize="12" fill="#b91c1c">Heated in a water bath</text>
        </g>
      )}
      {tube(510, o.colour, cloudy ? 0.97 : 0.95, heating ? -30 : 0)}
      {cloudy && Array.from({ length: 10 }, (_, i) => (
        <circle key={i} cx={490 + ((i * 17) % 40)} cy={190 + ((i * 23) % 80) - (heating ? 30 : 0)} r="3" fill="#fff" opacity="0.8" />
      ))}

      {/* dropper */}
      <g transform="translate(330 70)">
        <path d="M0 0 v40 M-8 40 h16 l-3 30 h-10 Z" fill="#cbd5e1" stroke="#64748b" strokeWidth="3" />
        <ellipse cx="0" cy="-8" rx="9" ry="14" fill="#111827" />
        {(state.added || state.drops > 0) && <circle cx="0" cy="84" r="4" fill={t.colours[3] === "#ffffff" ? "#94a3b8" : state.test === "dcpip" ? "#1d4ed8" : t.colours[0]} />}
      </g>
      <text x="330" y="190" textAnchor="middle" fontSize="13" fill="#475569">{t.reagent}</text>
      <path d="M255 215 H405 M390 200 l16 15 l-16 15" stroke="#2563eb" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {state.test === "dcpip" && state.drops > 0 && <text x="510" y="330" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0b1f4a">{state.drops} drops</text>}
    </svg>
  );
}
