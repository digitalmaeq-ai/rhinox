import type { JSX } from "react";

// Drawn 2D shapes for ShapeRoundsRenderer: pure SVG, viewBox 0 0 80 80, looked
// up by a shape key ("pentagon", "right-triangle", ...). Unknown keys fall back
// to a neutral tile with the first letter.

function regular(sides: number, radius: number, rotationDeg: number) {
  return Array.from({ length: sides }, (_, i) => {
    const angle = ((rotationDeg + (360 / sides) * i) * Math.PI) / 180;
    return `${(40 + radius * Math.cos(angle)).toFixed(1)},${(42 + radius * Math.sin(angle)).toFixed(1)}`;
  }).join(" ");
}

function star(points: number, outer: number, inner: number) {
  return Array.from({ length: points * 2 }, (_, i) => {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = ((-90 + (180 / points) * i) * Math.PI) / 180;
    return `${(40 + radius * Math.cos(angle)).toFixed(1)},${(42 + radius * Math.sin(angle)).toFixed(1)}`;
  }).join(" ");
}

interface PolygonSpec {
  points: string;
  fill: string;
  stroke: string;
}

const polygons: Record<string, PolygonSpec> = {
  triangle: { points: "40,14 66,62 14,62", fill: "#df4f93", stroke: "#a2306a" },
  "tall-triangle": { points: "40,8 56,64 24,64", fill: "#9b59d0", stroke: "#6b3a99" },
  "right-triangle": { points: "16,64 16,18 66,64", fill: "#e8900c", stroke: "#99590a" },
  square: { points: "18,20 62,20 62,64 18,64", fill: "#2f6fde", stroke: "#1d4fa6" },
  rectangle: { points: "8,26 72,26 72,60 8,60", fill: "#12a383", stroke: "#0b6f59" },
  rhombus: { points: "40,10 66,40 40,70 14,40", fill: "#3b9bff", stroke: "#1d4fa6" },
  parallelogram: { points: "26,24 72,24 54,60 8,60", fill: "#9b59d0", stroke: "#6b3a99" },
  trapezium: { points: "28,24 52,24 70,60 10,60", fill: "#e84a3c", stroke: "#b3342a" },
  kite: { points: "40,8 62,32 40,72 18,32", fill: "#f5c542", stroke: "#b8961e" },
  pentagon: { points: regular(5, 29, -90), fill: "#12a383", stroke: "#0b6f59" },
  hexagon: { points: regular(6, 29, 0), fill: "#2f6fde", stroke: "#1d4fa6" },
  octagon: { points: regular(8, 29, -67.5), fill: "#df4f93", stroke: "#a2306a" },
  star: { points: star(5, 31, 13), fill: "#f5a623", stroke: "#b86f0e" },
};

const curved: Record<string, () => JSX.Element> = {
  circle: () => <circle cx={40} cy={42} r={26} fill="#f5a623" stroke="#b86f0e" strokeWidth={2} />,
  oval: () => <ellipse cx={40} cy={42} rx={32} ry={19} fill="#e84a3c" stroke="#b3342a" strokeWidth={2} />,
  semicircle: () => <path d="M10 54A30 30 0 0 1 70 54Z" fill="#12a383" stroke="#0b6f59" strokeWidth={2} strokeLinejoin="round" />,
  "quarter-circle": () => <path d="M14 66V16A50 50 0 0 1 64 66Z" fill="#9b59d0" stroke="#6b3a99" strokeWidth={2} strokeLinejoin="round" />,
};

export function shapeName(key: string) {
  const text = key.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function hasShape(key: string) {
  return key in polygons || key in curved;
}

export function ShapeArt({ shape, size = 60 }: { shape: string; size?: number }) {
  const poly = polygons[shape];
  const Curve = curved[shape];
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true" focusable="false" style={{ display: "block", overflow: "visible" }}>
      <ellipse cx={40} cy={72} rx={24} ry={3.5} fill="#0f2a44" opacity={0.12} />
      {poly ? (
        <polygon points={poly.points} fill={poly.fill} stroke={poly.stroke} strokeWidth={2} strokeLinejoin="round" />
      ) : Curve ? (
        <Curve />
      ) : (
        <>
          <rect x={12} y={14} width={56} height={52} rx={10} fill="#dbeaff" stroke="#0f6fde" strokeWidth={1.4} />
          <text x={40} y={41} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={700} fill="#0f6fde">
            {shape.charAt(0).toUpperCase()}
          </text>
        </>
      )}
    </svg>
  );
}
