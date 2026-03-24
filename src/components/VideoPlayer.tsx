"use client";

import { useRef, useCallback, useState } from "react";
import { markLessonComplete } from "@/lib/progress";

interface VideoPlayerProps {
  src: string;
  lessonId: string;
  poster?: string;
  onEnded?: () => void;
}

function isGoogleDriveId(src: string): boolean {
  // Google Drive file IDs are alphanumeric + hyphens/underscores, typically 25-50 chars
  // Not a URL path (no / or .) — distinguish from /videos/foo.mp4
  return /^[a-zA-Z0-9_-]{20,}$/.test(src);
}

export default function VideoPlayer({ src, lessonId, poster, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const handleEnded = useCallback(() => {
    markLessonComplete(lessonId);
    window.dispatchEvent(new Event("progress-updated"));
    onEnded?.();
  }, [lessonId, onEnded]);

  // Mark complete when user watches > 90%
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.duration && video.currentTime / video.duration > 0.9) {
      markLessonComplete(lessonId);
      window.dispatchEvent(new Event("progress-updated"));
    }
  }, [lessonId]);

  if (!src) {
    return (
      <div className="w-full aspect-video bg-[#0a0a0a] rounded-xl flex items-center justify-center">
        <div className="text-center text-[#666]">
          <svg className="w-14 h-14 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-[14px] font-medium">No video available</p>
          <p className="text-[12px] mt-1 opacity-60">Run the extractor to download videos</p>
        </div>
      </div>
    );
  }

  // Google Drive iframe embed
  if (isGoogleDriveId(src)) {
    const embedUrl = `https://drive.google.com/file/d/${src}/preview`;
    return (
      <div className="w-full aspect-video bg-[#0a0a0a] rounded-xl overflow-hidden shadow-lg relative">
        {/* Poster overlay before iframe loads */}
        {poster && !iframeLoaded && (
          <div className="absolute inset-0 z-10">
            <img src={poster} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                <svg className="w-7 h-7 text-[#191919] ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          </div>
        )}
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
          onLoad={() => setIframeLoaded(true)}
        />
      </div>
    );
  }

  // Local video file
  return (
    <div className="w-full aspect-video bg-[#0a0a0a] rounded-xl overflow-hidden shadow-lg">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        className="w-full h-full"
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        playsInline
      >
        Your browser does not support the video element.
      </video>
    </div>
  );
}
