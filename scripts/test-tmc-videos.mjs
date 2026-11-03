#!/usr/bin/env node
import assert from "node:assert/strict";
import { TMC_VIDEOS, YOUTUBE_CHANNEL_URL, YOUTUBE_ID, videoEmbedUrl } from "../lib/tmc/videos.ts";

// One bonus video per term, unique ids, and a video is either unpublished (null) or a real YouTube id.
assert.deepEqual(TMC_VIDEOS.map((video) => video.term), [1, 2, 3]);
assert.equal(new Set(TMC_VIDEOS.map((video) => video.id)).size, TMC_VIDEOS.length);
for (const video of TMC_VIDEOS) {
  assert.ok(video.youtubeId === null || YOUTUBE_ID.test(video.youtubeId), `${video.id} needs an 11-character YouTube id or null`);
}
assert.ok(YOUTUBE_CHANNEL_URL === null || YOUTUBE_CHANNEL_URL.startsWith("https://"));

// The player uses the privacy-enhanced address and the id cannot add extra address parts.
assert.ok(videoEmbedUrl("dQw4w9WgXcQ").startsWith("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?"));
assert.equal(YOUTUBE_ID.test("abc/../def"), false);
assert.equal(YOUTUBE_ID.test("dQw4w9WgXcQ"), true);
console.log("tmc videos tests passed");
