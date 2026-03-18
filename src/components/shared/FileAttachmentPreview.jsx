// chat-app-client/src/components/shared/FileAttachmentPreview.jsx
"use client";
import { X, FileText, Film, Music, File } from "lucide-react";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimeType }) {
  if (mimeType?.startsWith("video/")) return <Film size={20} className="text-accent" />;
  if (mimeType?.startsWith("audio/")) return <Music size={20} className="text-accent" />;
  if (mimeType?.startsWith("text/") || mimeType === "application/pdf")
    return <FileText size={20} className="text-accent" />;
  return <File size={20} className="text-accent" />;
}

export default function FileAttachmentPreview({
  files,
  previews,
  progress,
  errors,
  uploading,
  onRemove,
}) {
  if (!files || files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-3 pb-2">
      {files.map((file, i) => {
        const hasError = !!errors[i];
        const isImage = file.type?.startsWith("image/");
        const pct = progress[i] ?? 0;
        const started = pct > 0 || uploading;

        return (
          <div
            key={i}
            className={`relative flex items-center gap-2 rounded-lg px-2 py-1.5 bg-slate-surface border ${
              hasError ? "border-red-500" : "border-white/10"
            }`}
            style={{ maxWidth: 200 }}
          >
            {/* Thumbnail or icon */}
            {isImage && previews[i] ? (
              <img
                src={previews[i]}
                alt={file.name}
                className="h-10 w-10 rounded object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-10 w-10 flex items-center justify-center flex-shrink-0">
                <FileIcon mimeType={file.type} />
              </div>
            )}

            {/* Info */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-ivory text-xs truncate max-w-[100px]">
                {file.name}
              </span>
              <span className="text-ivory/50 text-xs">{formatBytes(file.size)}</span>

              {/* Progress bar */}
              {started && !hasError && (
                <div className="mt-1 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-200"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}

              {/* Error */}
              {hasError && (
                <span className="text-red-400 text-xs truncate">{errors[i]}</span>
              )}
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemove(i)}
              disabled={uploading}
              className="ml-1 text-ivory/40 hover:text-red-400 disabled:opacity-30 flex-shrink-0"
              aria-label="Remove file"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
