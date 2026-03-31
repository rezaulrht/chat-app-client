// chat-app-client/src/components/shared/FileAttachmentDisplay.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import { Download, FileText, Film, Music, X, Play, Pause } from "lucide-react";

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentIcon({ resourceType }) {
  if (resourceType === "video")
    return <Film size={16} className="text-accent" />;
  if (resourceType === "audio")
    return <Music size={16} className="text-accent" />;
  if (resourceType === "image") return null;
  return <FileText size={16} className="text-accent" />;
}

// Inline audio player for voice messages / audio attachments
function AudioPlayer({ att }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    audio.currentTime = (x / rect.width) * duration;
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2.5 mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl max-w-[260px]">
      <button
        onClick={togglePlay}
        className="shrink-0 w-8 h-8 flex items-center justify-center bg-accent hover:bg-accent/80 rounded-full transition"
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div
          className="h-1.5 bg-white/10 rounded-full cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-ivory/30">
          {fmt(currentTime)} / {fmt(duration)}
        </span>
      </div>

      <a
        href={att.url}
        download={att.name}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-ivory/30 hover:text-accent transition-colors"
        title="Download"
        onClick={(e) => e.stopPropagation()}
      >
        <Download size={13} />
      </a>

      <audio
        ref={audioRef}
        src={att.url}
        preload="metadata"
        className="hidden"
      />
    </div>
  );
}

export default function FileAttachmentDisplay({ attachments }) {
  const [lightbox, setLightbox] = useState(null);

  if (!attachments || attachments.length === 0) return null;

  const images = attachments.filter((a) => a.resourceType === "image");
  const audios = attachments.filter((a) => a.resourceType === "audio");
  const others = attachments.filter(
    (a) => a.resourceType !== "image" && a.resourceType !== "audio",
  );

  return (
    <>
      {/* Images grid */}
      {images.length > 0 && (
        <div
          className={`flex flex-wrap gap-1 mt-1 ${others.length + audios.length > 0 ? "mb-1" : ""}`}
        >
          {images.map((att, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightbox(att.url)}
              className="rounded overflow-hidden border border-white/10 hover:border-accent/40 transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={att.url}
                alt={att.name || "image"}
                className="object-cover"
                style={{ maxWidth: 240, maxHeight: 180 }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Audio / voice messages */}
      {audios.map((att, i) => (
        <AudioPlayer key={i} att={att} />
      ))}

      {/* Non-image, non-audio files */}
      {others.map((att, i) => (
        <a
          key={i}
          href={att.url}
          download={att.name}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 mt-1 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors max-w-xs"
        >
          <AttachmentIcon resourceType={att.resourceType} />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-ivory text-xs truncate">
              {att.name || "file"}
            </span>
            {att.size > 0 && (
              <span className="text-ivory/40 text-xs">
                {formatBytes(att.size)}
              </span>
            )}
          </div>
          <Download size={14} className="text-ivory/40 flex-shrink-0" />
        </a>
      ))}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            aria-label="Close"
          >
            <X size={28} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Full size"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
