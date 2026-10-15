"use client";

import { useState } from "react";

import { BODY_PARTS, LAYERS, shapesOf, type BodyPart, type LayerId, type Shape } from "@/lib/human-body/body-data";

// The flat view: the same parts as the 3D body, seen from the front as an
// illustration. It works on every device (no WebGL needed) and uses the same
// peeling rules: the studied layer is solid and tappable, layers beneath it are
// a faint ghost, layers above it are gone.

const LAYER_ORDER: LayerId[] = LAYERS.map((layer) => layer.id);

interface Props {
  layer: LayerId;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function alphaFor(index: number, focusIndex: number, id: LayerId): number {
  if (index < focusIndex) return 0;
  if (index === focusIndex) return id === "skin" ? 0.8 : 1;
  return index === focusIndex + 1 ? 0.16 : 0.06;
}

// SVG y points down while the body's y points up, so every y is negated.
function Drawn({ shape, fill, stroke, strokeWidth }: { shape: Shape; fill: string; stroke: string; strokeWidth: number }) {
  const [x, y] = shape.p;
  if (shape.t === "ring") {
    return <ellipse cx={x} cy={-y} rx={shape.rx} ry={0.035} fill="none" stroke={fill} strokeWidth={shape.tube * 1.8} />;
  }
  const turn = `rotate(${(-(shape.rot ?? 0) * 180) / Math.PI} ${x} ${-y})`;
  if (shape.t === "c") {
    return <rect x={x - shape.rad} y={-y - shape.len / 2} width={shape.rad * 2} height={shape.len} rx={shape.rad} fill={fill} stroke={stroke} strokeWidth={strokeWidth} transform={turn} />;
  }
  return <ellipse cx={x} cy={-y} rx={shape.r[0]} ry={shape.r[1]} fill={fill} stroke={stroke} strokeWidth={strokeWidth} transform={turn} />;
}

export default function HumanBody2D({ layer, selectedId, onSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const focusIndex = LAYER_ORDER.indexOf(layer);

  // Deepest layer first, so shallower layers paint over it.
  const ordered = [...LAYER_ORDER].reverse();

  return (
    <svg viewBox="-0.95 -2 1.9 4" role="img" aria-label="Flat picture of the human body. Use the list of parts below the picture to choose a part." style={{ width: "100%", height: "100%", display: "block" }} onClick={() => onSelect(null)}>
      <defs>
        <filter id="rx-body-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.025" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <ellipse cx="0" cy="1.85" rx="0.95" ry="0.12" fill="rgba(60,140,255,0.12)" stroke="rgba(110,180,255,0.55)" strokeWidth="0.012" />
      {ordered.map((id) => {
        const index = LAYER_ORDER.indexOf(id);
        const alpha = alphaFor(index, focusIndex, id);
        if (alpha === 0) return null;
        const studied = index === focusIndex;
        return (
          <g key={id} opacity={alpha} style={{ transition: "opacity 0.4s ease" }}>
            {BODY_PARTS.filter((part: BodyPart) => part.layer === id).map((part) => {
              const isSelected = selectedId === part.id;
              const isHover = hovered === part.id;
              const stroke = isSelected ? "#5fb0ff" : isHover ? "#a9d3ff" : "rgba(0,0,0,0.18)";
              const width = isSelected ? 0.022 : isHover ? 0.016 : 0.006;
              return (
                <g
                  key={part.id}
                  filter={isSelected ? "url(#rx-body-glow)" : undefined}
                  style={{ cursor: studied ? "pointer" : "default", pointerEvents: studied ? "auto" : "none" }}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect(part.id);
                  }}
                  onPointerEnter={() => studied && setHovered(part.id)}
                  onPointerLeave={() => setHovered(null)}
                >
                  {shapesOf(part).map((shape, shapeIndex) => (
                    <Drawn key={shapeIndex} shape={shape} fill={part.color} stroke={stroke} strokeWidth={width} />
                  ))}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
