import styles from "./LabPreviews.module.css";

/**
 * Small animated drawings for the "Hands-on labs" cards. Each one hints at
 * what the learner does in the real experiment. They are plain SVG with CSS
 * animation (no extra library), stop for reduced motion, and are described
 * for screen readers.
 */

export function TitrationPreview() {
  return (
    <svg className={styles.svg} viewBox="0 0 400 260" role="img" aria-label="Animated titration: acid drips from a burette into a flask and the liquid turns pink at the end point">
      <defs>
        <clipPath id="lab-flask-clip">
          <path d="M172 178h56l30 58q5 12-8 12H150q-13 0-8-12Z" />
        </clipPath>
      </defs>
      {/* Burette */}
      <rect x="188" y="14" width="24" height="104" rx="4" className={styles.glass} />
      <rect x="191" y="30" width="18" height="86" rx="2" className={`${styles.acid} ${styles.level}`} />
      {[34, 54, 74, 94].map((y) => (
        <line key={y} x1="188" x2="196" y1={y} y2={y} className={styles.tick} />
      ))}
      <rect x="194" y="118" width="12" height="9" rx="2" className={styles.tap} />
      <circle cx="200" cy="134" r="4" className={styles.drop} />
      {/* Flask */}
      <path d="M172 178h56l30 58q5 12-8 12H150q-13 0-8-12Z" className={styles.glass} />
      <rect x="172" y="170" width="56" height="8" rx="2" className={styles.glass} />
      <g clipPath="url(#lab-flask-clip)">
        <rect x="130" y="212" width="140" height="40" className={styles.indicator} />
      </g>
    </svg>
  );
}

export function AcidBasePreview() {
  const colours = ["#e53935", "#fb8c00", "#fdd835", "#43a047", "#1e88e5", "#5e35b1", "#8e24aa"];
  return (
    <svg className={styles.svg} viewBox="0 0 400 260" role="img" aria-label="Animated pH scale: a pointer moves along seven colours from acid (red) to alkali (purple)">
      {colours.map((colour, index) => (
        <g key={colour}>
          <rect x={52 + index * 44} y="96" width="38" height="92" rx="6" fill={colour} opacity="0.92" />
          <text x={71 + index * 44} y="212" textAnchor="middle" className={styles.label}>
            {1 + index * 2}
          </text>
        </g>
      ))}
      <g className={styles.pointer}>
        <path d="M71 80l-9-16h18Z" className={styles.pointerShape} />
      </g>
      <text x="52" y="238" className={styles.label}>Acid</text>
      <text x="348" y="238" textAnchor="end" className={styles.label}>Alkali</text>
      <text x="200" y="40" textAnchor="middle" className={styles.heading}>pH scale</text>
    </svg>
  );
}

export function ElectrolysisPreview() {
  return (
    <svg className={styles.svg} viewBox="0 0 400 260" role="img" aria-label="Animated electrolysis: bubbles rise from two electrodes in a beaker connected to a battery">
      <rect x="150" y="14" width="100" height="26" rx="4" className={styles.battery} />
      <text x="200" y="32" textAnchor="middle" className={styles.label}>+  −</text>
      <path d="M170 40v30M230 40v30" className={styles.wire} />
      <rect x="166" y="66" width="8" height="120" rx="2" className={styles.electrode} />
      <rect x="226" y="66" width="8" height="120" rx="2" className={styles.electrode} />
      <path d="M120 100v112q0 14 14 14h132q14 0 14-14V100" className={styles.glassLine} />
      <rect x="122" y="130" width="156" height="94" rx="10" className={styles.liquid} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={`a${i}`} cx={160 + (i % 2) * 8} cy="190" r={3 + (i % 2)} className={styles.bubble} style={{ animationDelay: `${i * 0.55}s` }} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <circle key={`b${i}`} cx={228 + (i % 2) * 8} cy="190" r={3 + (i % 2)} className={styles.bubble} style={{ animationDelay: `${0.25 + i * 0.55}s` }} />
      ))}
    </svg>
  );
}

export function CircuitPreview() {
  return (
    <svg className={styles.svg} viewBox="0 0 400 260" role="img" aria-label="Animated electric circuit: current flows from a cell around a loop and lights a bulb">
      <path d="M90 80H310V190H90Z" className={styles.wire} />
      <path d="M90 80H310V190H90Z" className={styles.current} />
      {/* Cell */}
      <rect x="76" y="116" width="28" height="38" fill="#0b2342" />
      <line x1="80" x2="100" y1="124" y2="124" className={styles.cellLong} />
      <line x1="86" x2="94" y1="140" y2="140" className={styles.cellShort} />
      {/* Bulb */}
      <circle cx="310" cy="135" r="26" className={styles.glow} />
      <circle cx="310" cy="135" r="17" className={styles.bulb} />
      <path d="M302 142l5-10 3 6 3-6 5 10" className={styles.filament} />
      {/* Switch */}
      <circle cx="200" cy="190" r="4" className={styles.node} />
      <circle cx="240" cy="190" r="4" className={styles.node} />
      <line x1="200" x2="238" y1="190" y2="190" className={styles.switch} />
    </svg>
  );
}
