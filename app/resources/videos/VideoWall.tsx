"use client";

import { useState } from "react";

import { videoEmbedUrl } from "@/lib/tmc/videos";
import styles from "./videos.module.css";

export interface WallVideo {
  id: string;
  term: number;
  title: string;
  subtitle: string;
  youtubeId: string | null;
  colour: string;
}

// Nothing is requested from YouTube until Watch is pressed (same rule as the Think • Move • Code! home).
export default function VideoWall({ videos, channelUrl }: { videos: WallVideo[]; channelUrl: string | null }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playing = videos.find((v) => v.id === playingId && v.youtubeId) ?? null;

  return (
    <div>
      <div className={styles.screen}>
        {playing?.youtubeId ? (
          <iframe src={videoEmbedUrl(playing.youtubeId)} title={playing.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        ) : (
          <div className={styles.idle}>
            <span className={styles.bigPlay} aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg></span>
            <p>No video is published yet.</p>
            <small>When a bonus video goes live, press Watch and it plays right here.</small>
          </div>
        )}
      </div>
      <ul className={styles.posters}>
        {videos.map((v) => (
          <li key={v.id} className={styles.poster} style={{ ["--c" as string]: v.colour }}>
            <span className={styles.posterTerm}>Term {v.term}</span>
            <strong>{v.title}</strong>
            <span className={styles.posterSub}>{v.subtitle}</span>
            {v.youtubeId ? (
              <button type="button" className={styles.watch} onClick={() => setPlayingId(v.id)} aria-pressed={playingId === v.id}>Watch</button>
            ) : (
              <span className={styles.soon}>Coming soon</span>
            )}
          </li>
        ))}
      </ul>
      {channelUrl && <a className={styles.channel} href={channelUrl} target="_blank" rel="noopener noreferrer">Our YouTube channel ↗</a>}
    </div>
  );
}
