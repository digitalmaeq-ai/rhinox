"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { getBody, planets, sun } from "@/lib/solar-system/planet-data";
import { orbitPosition, orbitRadius, spinAngle, trailPoints } from "@/lib/solar-system/orbital-engine";
import type { BodyId } from "@/lib/solar-system/solar-system-types";

import type { SolarViewProps } from "./view-types";

// Interactive 2D top-down Solar System, drawn in SVG. Positions are updated
// straight on the DOM every frame (no React re-render), pan/zoom are pointer
// based (mouse, touch, pinch, wheel).

const UNIT = 12; // scene units -> SVG units
const MIN_ZOOM = 0.6;
const MAX_ZOOM = 14;

export default function SolarSystem2D({ clockRef, settings, selectedId, onSelect, apiRef, reducedMotion }: SolarViewProps) {
  const gradientId = useId().replace(/:/g, "");
  const box = useRef<HTMLDivElement>(null);
  const content = useRef<SVGGElement>(null);
  const [size, setSize] = useState({ w: 800, h: 560 });
  const [zoom, setZoom] = useState(1);

  const view = useRef({ cx: 0, cy: 0, zoom: 1, zoomGoal: 1 });
  const following = useRef(false);
  const live = useRef({ settings, selectedId });
  useEffect(() => {
    live.current = { settings, selectedId };
  }, [settings, selectedId]);

  const bodyRefs = useRef<Record<string, SVGGElement | null>>({});
  const spinRefs = useRef<Record<string, SVGLineElement | null>>({});
  const trailRefs = useRef<Record<string, SVGPathElement | null>>({});

  const maxRadius = useMemo(() => Math.max(...planets.map((p) => orbitRadius(p, settings.scale))) * UNIT, [settings.scale]);
  const fit = Math.min(size.w, size.h) / (2 * (maxRadius + 36));

  // Keep the size of the viewport.
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ w: width, h: height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Expose zoom/reset to the toolbar.
  useEffect(() => {
    apiRef.current = {
      zoomBy: (factor) => {
        view.current.zoomGoal = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.current.zoomGoal * factor));
      },
      resetView: () => {
        following.current = false;
        view.current.cx = 0;
        view.current.cy = 0;
        view.current.zoomGoal = 1;
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef]);

  // Selecting a planet zooms in on it and follows it round its orbit.
  useEffect(() => {
    if (selectedId) {
      following.current = true;
      view.current.zoomGoal = Math.max(view.current.zoomGoal, selectedId === "sun" ? 1.6 : 3.2);
    } else {
      following.current = false;
    }
  }, [selectedId]);

  // The animation frame loop.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const { settings: current, selectedId: selected } = live.current;
      const clock = clockRef.current;
      const v = view.current;
      const ease = reducedMotion ? 1 : 1 - Math.exp(-dt * 5);

      for (const body of planets) {
        const group = bodyRefs.current[body.id];
        if (!group) continue;
        const { x, z } = orbitPosition(body, clock.days, current.scale);
        group.setAttribute("transform", `translate(${(x * UNIT).toFixed(2)} ${(z * UNIT).toFixed(2)})`);
        const tick = spinRefs.current[body.id];
        if (tick) tick.setAttribute("transform", `rotate(${((spinAngle(body, clock.spin) * 180) / Math.PI).toFixed(1)})`);
        const trail = trailRefs.current[body.id];
        if (trail) {
          if (current.showTrails) {
            const points = trailPoints(body, clock.days, current.scale, 28, 1.5);
            trail.setAttribute("d", points.map((p, i) => `${i === 0 ? "M" : "L"}${(p.x * UNIT).toFixed(1)} ${(p.z * UNIT).toFixed(1)}`).join(""));
            trail.style.display = "";
          } else {
            trail.style.display = "none";
          }
        }
      }
      const sunSpin = spinRefs.current.sun;
      if (sunSpin) sunSpin.setAttribute("transform", `rotate(${((spinAngle(sun, clock.spin) * 180) / Math.PI).toFixed(1)})`);

      if (following.current && selected) {
        const body = getBody(selected);
        if (body && body.id !== "sun") {
          const { x, z } = orbitPosition(body, clock.days, current.scale);
          v.cx += (x * UNIT - v.cx) * ease;
          v.cy += (z * UNIT - v.cy) * ease;
        } else {
          v.cx += (0 - v.cx) * ease;
          v.cy += (0 - v.cy) * ease;
        }
      }

      if (Math.abs(v.zoomGoal - v.zoom) > 0.0005) {
        v.zoom += (v.zoomGoal - v.zoom) * ease;
        setZoom(v.zoom);
      }

      const total = fit * v.zoom;
      content.current?.setAttribute(
        "transform",
        `translate(${(size.w / 2 - v.cx * total).toFixed(2)} ${(size.h / 2 - v.cy * total).toFixed(2)}) scale(${total.toFixed(4)})`,
      );
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [clockRef, fit, size.w, size.h, reducedMotion]);

  // --- Pointer interaction: drag to pan, pinch / wheel to zoom, tap to select.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ moved: 0, pinch: 0, startTarget: null as string | null });

  const onPointerDown = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    gesture.current.moved = 0;
    gesture.current.startTarget = (event.target as Element).closest("[data-body]")?.getAttribute("data-body") ?? null;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current.pinch = Math.hypot(a.x - b.x, a.y - b.y);
    }
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      const previous = pointers.current.get(event.pointerId);
      if (!previous) return;
      const current = { x: event.clientX, y: event.clientY };
      pointers.current.set(event.pointerId, current);
      const v = view.current;

      if (pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (gesture.current.pinch > 0) {
          const factor = distance / gesture.current.pinch;
          v.zoomGoal = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoomGoal * factor));
          v.zoom = v.zoomGoal;
          setZoom(v.zoom);
        }
        gesture.current.pinch = distance;
        gesture.current.moved += 10;
        return;
      }

      const dx = current.x - previous.x;
      const dy = current.y - previous.y;
      gesture.current.moved += Math.abs(dx) + Math.abs(dy);
      if (gesture.current.moved > 5) {
        following.current = false;
        const total = fit * v.zoom;
        v.cx -= dx / total;
        v.cy -= dy / total;
      }
    },
    [fit],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      pointers.current.delete(event.pointerId);
      if (pointers.current.size === 0 && gesture.current.moved <= 5) {
        const id = gesture.current.startTarget;
        if (id) onSelect(id as BodyId);
      }
      gesture.current.pinch = 0;
    },
    [onSelect],
  );

  const onWheel = useCallback((event: React.WheelEvent<SVGSVGElement>) => {
    const v = view.current;
    v.zoomGoal = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoomGoal * (event.deltaY < 0 ? 1.15 : 1 / 1.15)));
  }, []);

  // Planet radius on screen grows gently with zoom, so the whole system is
  // readable at a glance and detail appears as you zoom in.
  const total = fit * zoom;
  const screenRadius = (displayRadius: number) => Math.max(3.2, (displayRadius * 6.2 + 1.5) * Math.pow(zoom, 0.5));
  const toUnits = (px: number) => px / total;

  return (
    <div ref={box} style={{ position: "relative", width: "100%", height: "100%", touchAction: "none" }}>
      <svg
        width={size.w}
        height={size.h}
        role="group"
        aria-label="Interactive 2D map of the Solar System. Select a planet from the list, or tap one on the map."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        style={{ display: "block", cursor: "grab", userSelect: "none" }}
      >
        <defs>
          <radialGradient id={`${gradientId}-sun`}>
            <stop offset="0%" stopColor="#fff6c8" />
            <stop offset="55%" stopColor="#ffc533" />
            <stop offset="100%" stopColor="#ff8a00" />
          </radialGradient>
          <radialGradient id={`${gradientId}-glow`}>
            <stop offset="0%" stopColor="#ffb21a" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffb21a" stopOpacity="0" />
          </radialGradient>
          {planets.map((body) => (
            <radialGradient key={body.id} id={`${gradientId}-${body.id}`} cx="35%" cy="32%" r="75%">
              <stop offset="0%" stopColor={body.color} />
              <stop offset="100%" stopColor={body.colorDeep} />
            </radialGradient>
          ))}
        </defs>

        <g ref={content}>
          {/* Orbits */}
          {settings.showOrbits &&
            planets.map((body) => (
              <circle
                key={`orbit-${body.id}`}
                r={orbitRadius(body, settings.scale) * UNIT}
                fill="none"
                stroke={selectedId === body.id ? "#6fb4ff" : "rgba(111,180,255,0.3)"}
                strokeWidth={toUnits(selectedId === body.id ? 1.6 : 1)}
                strokeDasharray={selectedId === body.id ? undefined : `${toUnits(4)} ${toUnits(5)}`}
              />
            ))}

          {/* Trails */}
          {planets.map((body) => (
            <path
              key={`trail-${body.id}`}
              ref={(node) => {
                trailRefs.current[body.id] = node;
              }}
              fill="none"
              stroke={body.color}
              strokeWidth={toUnits(2.4)}
              strokeLinecap="round"
              opacity={0.85}
              style={{ display: "none" }}
            />
          ))}

          {/* Sun */}
          <g data-body="sun" style={{ cursor: "pointer" }}>
            <circle r={toUnits(screenRadius(sun.displayRadius) * 2.4)} fill={`url(#${gradientId}-glow)`} />
            <circle r={toUnits(screenRadius(sun.displayRadius) * 0.8)} fill={`url(#${gradientId}-sun)`} />
            <line ref={(node) => { spinRefs.current.sun = node; }} x1={0} y1={0} x2={toUnits(screenRadius(sun.displayRadius) * 0.8)} y2={0} stroke="rgba(120,60,0,0.45)" strokeWidth={toUnits(1.6)} />
            {selectedId === "sun" && <circle r={toUnits(screenRadius(sun.displayRadius) * 0.8 + 7)} fill="none" stroke="#ffd25e" strokeWidth={toUnits(2)} />}
            {settings.showLabels && (
              <text y={toUnits(screenRadius(sun.displayRadius) * 0.8 + 16)} textAnchor="middle" fontSize={toUnits(12)} fontWeight={700} fill="#ffe9b0" style={{ pointerEvents: "none" }}>
                Sun
              </text>
            )}
            <circle r={toUnits(Math.max(screenRadius(sun.displayRadius) * 0.8, 20))} fill="transparent" />
          </g>

          {/* Planets */}
          {planets.map((body) => {
            const radius = toUnits(screenRadius(body.displayRadius));
            const selected = selectedId === body.id;
            return (
              <g
                key={body.id}
                ref={(node) => {
                  bodyRefs.current[body.id] = node;
                }}
                data-body={body.id}
                style={{ cursor: "pointer" }}
              >
                {body.hasRings && (
                  <ellipse rx={radius * 2.0} ry={radius * 0.62} fill="none" stroke="rgba(236,214,160,0.85)" strokeWidth={radius * 0.28} transform="rotate(-18)" />
                )}
                <circle r={radius} fill={`url(#${gradientId}-${body.id})`} />
                <line ref={(node) => { spinRefs.current[body.id] = node; }} x1={0} y1={0} x2={radius} y2={0} stroke="rgba(8,20,40,0.45)" strokeWidth={Math.max(toUnits(1.2), radius * 0.12)} strokeLinecap="round" />
                {selected && <circle r={radius + toUnits(6)} fill="none" stroke="#6fb4ff" strokeWidth={toUnits(2)} />}
                {settings.showLabels && (
                  <text y={-radius - toUnits(7)} textAnchor="middle" fontSize={toUnits(12)} fontWeight={selected ? 800 : 600} fill={selected ? "#ffffff" : "#b9d6f5"} style={{ pointerEvents: "none" }}>
                    {body.name}
                  </text>
                )}
                <circle r={Math.max(radius + toUnits(8), toUnits(16))} fill="transparent" />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

