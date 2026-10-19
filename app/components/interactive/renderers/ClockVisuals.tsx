import type { PointerEvent as ReactPointerEvent } from "react";

// Analogue clock and digital display for ClockRoundsRenderer. Pure SVG, no
// images. The clock can be read-only (a question) or interactive (the learner
// drags the hands, or taps the hand buttons next to it).

const NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1);

export function Clock({
  hour,
  minute,
  size = 160,
  onDial,
  label,
  activeHand,
}: {
  hour: number;
  minute: number;
  size?: number;
  /** When set, the dial responds to pointer: angle in degrees clockwise from 12. */
  onDial?: (angle: number) => void;
  label?: string;
  activeHand?: "hour" | "minute";
}) {
  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const minuteAngle = minute * 6;

  function handlePointer(event: ReactPointerEvent<SVGSVGElement>) {
    if (!onDial) return;
    if (event.type === "pointermove" && event.buttons === 0) return;
    const box = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    onDial((angle + 360) % 360);
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={label ?? "Clock"}
      style={{ display: "block", overflow: "visible", touchAction: onDial ? "none" : undefined, cursor: onDial ? "pointer" : undefined }}
      onPointerDown={onDial ? (event) => { event.currentTarget.setPointerCapture?.(event.pointerId); handlePointer(event); } : undefined}
      onPointerMove={onDial ? handlePointer : undefined}
    >
      <circle cx={60} cy={60} r={56} fill="#ffffff" stroke="#0b6f69" strokeWidth={4} />
      <circle cx={60} cy={60} r={56} fill="none" stroke="#9edbd6" strokeWidth={1} opacity={0.8} />
      {Array.from({ length: 60 }, (_, i) => {
        const long = i % 5 === 0;
        const a = (i * 6 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={60 + Math.sin(a) * (long ? 47 : 50)}
            y1={60 - Math.cos(a) * (long ? 47 : 50)}
            x2={60 + Math.sin(a) * 53}
            y2={60 - Math.cos(a) * 53}
            stroke="#5b6b78"
            strokeWidth={long ? 1.6 : 0.7}
          />
        );
      })}
      {NUMBERS.map((n) => {
        const a = (n * 30 * Math.PI) / 180;
        return (
          <text key={n} x={60 + Math.sin(a) * 38} y={60 - Math.cos(a) * 38} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={800} fill="#143d3a">
            {n}
          </text>
        );
      })}
      {/* hour hand: short and thick */}
      <line x1={60} y1={60} x2={60 + Math.sin((hourAngle * Math.PI) / 180) * 24} y2={60 - Math.cos((hourAngle * Math.PI) / 180) * 24} stroke={activeHand === "hour" ? "#e8900c" : "#143d3a"} strokeWidth={5} strokeLinecap="round" />
      {/* minute hand: long and thin */}
      <line x1={60} y1={60} x2={60 + Math.sin((minuteAngle * Math.PI) / 180) * 38} y2={60 - Math.cos((minuteAngle * Math.PI) / 180) * 38} stroke={activeHand === "minute" ? "#e8900c" : "#0f9d94"} strokeWidth={3} strokeLinecap="round" />
      <circle cx={60} cy={60} r={3.6} fill="#143d3a" />
    </svg>
  );
}

export function DigitalTime({ time }: { time: string }) {
  return (
    <span
      aria-label={`Digital time ${time}`}
      role="img"
      style={{
        display: "inline-block",
        padding: "6px 18px",
        borderRadius: 12,
        background: "#0b2b29",
        color: "#7dfbe9",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: 40,
        fontWeight: 700,
        letterSpacing: 2,
        boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)",
      }}
    >
      {time}
    </span>
  );
}
