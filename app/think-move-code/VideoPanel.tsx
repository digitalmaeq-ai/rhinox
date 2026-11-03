"use client";

import { useState } from "react";

import styles from "./home.module.css";
import { videoEmbedUrl, type TmcVideo } from "@/lib/tmc/videos";

// The video list. Nothing is requested from YouTube until Watch is pressed.
export default function VideoPanel({ videos, channelUrl }: { videos: readonly TmcVideo[]; channelUrl: string | null }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playing = videos.find((video) => video.id === playingId && video.youtubeId) ?? null;

  return (
    <div>
      {playing?.youtubeId ? (
        <div className={styles.player}>
          <iframe
            src={videoEmbedUrl(playing.youtubeId)}
            title={playing.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : null}
      <ul className={styles.videoList}>
        {videos.map((video) => (
          <li key={video.id}>
            <span className={styles.playIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
            <span className={styles.videoTitle}>{video.title}</span>
            {video.youtubeId ? (
              <button type="button" className={styles.watch} onClick={() => setPlayingId(video.id)} aria-pressed={playingId === video.id}>
                Watch
              </button>
            ) : (
              <span className={styles.soon}>Coming soon</span>
            )}
          </li>
        ))}
      </ul>
      {channelUrl ? (
        <a className={styles.channel} href={channelUrl} target="_blank" rel="noopener noreferrer">
          Our YouTube channel ↗
        </a>
      ) : null}
    </div>
  );
}
