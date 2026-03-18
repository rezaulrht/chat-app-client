// chat-app-client/src/components/shared/FileAttachmentDisplay.jsx
"use client";
import { useState } from "react";
import { Download, FileText, Film, Music, X } from "lucide-react";

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentIcon({ resourceType }) {
  if (resourceType === "video") return <Film size={16} className="text-accent" />;
  if (resourceType === "audio") return <Music size={16} className="text-accent" />;
  if (resourceType === "image") return null;
  return <FileText size={16} className="text-accent" />;
}

export default function FileAttachmentDisplay({ attachments }) {
  const [lightbox, setLightbox] = useState(null); // url | null

  if (!attachments || attachments.length === 0) return null;

  const images = attachments.filter((a) => a.resourceType === "image");
  const others = attachments.filter((a) => a.resourceType !== "image");

  return (
    <>
      {/* Images grid */}
      {images.length > 0 && (
        <div className={`flex flex-wrap gap-1 mt-1 ${others.length > 0 ? "mb-1" : ""}`}>
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

      {/* Non-image files */}
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
            <span className="text-ivory text-xs truncate">{att.name || "file"}</span>
            {att.size > 0 && (
              <span className="text-ivory/40 text-xs">{formatBytes(att.size)}</span>
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
