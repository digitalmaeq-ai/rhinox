"use client";

import { EARTH_DIAMETER_KM, EARTH_GRAVITY, getBody, sources } from "@/lib/solar-system/planet-data";
import { formatDistance, formatMass, formatPeriod, formatRotation } from "@/lib/solar-system/orbital-engine";
import type { BodyId } from "@/lib/solar-system/solar-system-types";

import styles from "./solar-system.module.css";

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className={styles.stat}>
      <dt>{label}</dt>
      <dd>
        {value}
        {note && <span>{note}</span>}
      </dd>
    </div>
  );
}

function Compare({ label, ratio, text }: { label: string; ratio: number; text: string }) {
  const width = Math.min(100, Math.max(3, (Math.log10(Math.max(ratio, 0.01)) + 2) * 25));
  return (
    <div className={styles.compare}>
      <div className={styles.compareHead}>
        <span>{label}</span>
        <strong>{text}</strong>
      </div>
      <span className={styles.compareBar}>
        <span style={{ width: `${width}%` }} />
        <i style={{ left: "50%" }} aria-hidden="true" />
      </span>
    </div>
  );
}

export default function PlanetInfoPanel({ selectedId }: { selectedId: BodyId | null }) {
  const body = getBody(selectedId);

  if (!body) {
    return (
      <aside className={styles.info} aria-live="polite">
        <p className={styles.panelTitle}>Solar System</p>
        <h3 className={styles.infoName}>Eight planets, one star</h3>
        <p className={styles.tagline}>Select a planet from the list or tap one in the view to see its data.</p>
        <dl className={styles.stats}>
          <Stat label="Planets" value="8" note="4 rocky, 2 gas giants, 2 ice giants" />
          <Stat label="Star" value="The Sun" note="99.8% of the mass" />
          <Stat label="Closest" value="Mercury" note="0.39 AU" />
          <Stat label="Farthest" value="Neptune" note="30.1 AU" />
        </dl>
        <p className={styles.source}>
          1 AU (astronomical unit) is the average Earth to Sun distance: 149.6 million km. Planets are shown larger than their true size so they can be seen.
        </p>
      </aside>
    );
  }

  const isSun = body.id === "sun";

  return (
    <aside className={styles.info} aria-live="polite">
      <div className={styles.infoHead}>
        <span className={styles.bigDot} style={{ background: `radial-gradient(circle at 35% 30%, ${body.color}, ${body.colorDeep})` }} aria-hidden="true" />
        <div>
          <p className={styles.panelTitle}>{body.classification}</p>
          <h3 className={styles.infoName}>{body.name}</h3>
        </div>
      </div>
      <p className={styles.tagline}>{body.tagline}</p>

      <dl className={styles.stats}>
        <Stat label="Diameter" value={`${body.diameterKm.toLocaleString("en")} km`} />
        <Stat label="Mass" value={formatMass(body.massKg)} />
        {body.distanceKm && body.distanceAu && <Stat label="Distance from Sun" value={formatDistance(body.distanceKm)} note={`${body.distanceAu} AU`} />}
        <Stat label="Rotation (one day)" value={formatRotation(body.rotationHours)} />
        {body.orbitalDays && <Stat label="Orbit (one year)" value={formatPeriod(body.orbitalDays)} />}
        <Stat label="Average temperature" value={`${body.temperatureC.toLocaleString("en")} °C`} note={body.temperatureNote} />
        <Stat label="Surface gravity" value={`${body.gravityMs2} m/s²`} />
        <Stat label="Axial tilt" value={`${body.axialTiltDeg}°`} />
        {body.moons && <Stat label="Known moons" value={String(body.moons.count)} note={`${body.moons.asOf}${body.moons.note ? `. ${body.moons.note}` : ""}`} />}
      </dl>

      {!isSun && (
        <div className={styles.compareBlock}>
          <p className={styles.panelTitle}>Compared with Earth</p>
          <Compare label="Size" ratio={body.diameterKm / EARTH_DIAMETER_KM} text={`${(body.diameterKm / EARTH_DIAMETER_KM).toFixed(2)}×`} />
          <Compare label="Gravity" ratio={body.gravityMs2 / EARTH_GRAVITY} text={`${(body.gravityMs2 / EARTH_GRAVITY).toFixed(2)}×`} />
        </div>
      )}

      <p className={styles.panelTitle}>Key characteristics</p>
      <ul className={styles.bullets}>
        {body.characteristics.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <p className={styles.panelTitle}>Did you know?</p>
      <ul className={styles.bullets}>
        {body.facts.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <p className={styles.source}>
        Data: {sources.map((item) => item.label).join("; ")}. Orbits are simplified circles, and sizes and distances are adjusted for display.
      </p>
    </aside>
  );
}
