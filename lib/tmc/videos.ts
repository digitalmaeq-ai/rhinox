// Think • Move • Code! videos shown on the /think-move-code home.
//
// Plan (Oct 2026): no per-week videos in the books. There are three short bonus teacher videos,
// one per term. To publish one, upload it to YouTube and paste its 11-character video id into
// `youtubeId` below; until then the row shows "Coming soon". Nothing loads from YouTube until a
// visitor presses Watch, and the player uses the privacy-enhanced youtube-nocookie.com address.
// This file must stay free of imports so scripts can load it directly.

export interface TmcVideo {
  id: string;
  term: number;
  title: string;
  /** YouTube video id (11 characters), or null while the video is not published. */
  youtubeId: string | null;
}

export const TMC_VIDEOS: readonly TmcVideo[] = [
  { id: "n1-t1", term: 1, title: "Term 1 bonus video", youtubeId: null },
  { id: "n1-t2", term: 2, title: "Term 2 bonus video", youtubeId: null },
  { id: "n1-t3", term: 3, title: "Term 3 bonus video", youtubeId: null },
];

/** The Think • Move • Code! YouTube channel address, once it exists. */
export const YOUTUBE_CHANNEL_URL: string | null = null;

export const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export const videoEmbedUrl = (youtubeId: string) =>
  `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`;
