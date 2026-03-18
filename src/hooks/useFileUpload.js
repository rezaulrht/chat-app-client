// chat-app-client/src/hooks/useFileUpload.js
import { useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import api from "@/app/api/Axios";

const VIDEO_MAX = 100 * 1024 * 1024;  // 100 MB
const OTHER_MAX = 50 * 1024 * 1024;   // 50 MB
const MAX_FILES = 5;

function getResourceType(mimeType) {
  if (!mimeType) return "raw";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "raw";
}

export function useFileUpload() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);   // object URL for image/*, null for others
  const [progress, setProgress] = useState([]);   // 0–100 per file
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState([]);       // string | null per file
  const objectUrlsRef = useRef([]);               // track for cleanup

  const selectFiles = useCallback((fileList) => {
    const incoming = Array.from(fileList);
    setFiles((prev) => {
      const available = MAX_FILES - prev.length;
      if (available <= 0) {
        toast.error(`You can attach at most ${MAX_FILES} files per message`);
        return prev;
      }

      const accepted = [];
      const newPreviews = [];

      for (const file of incoming.slice(0, available)) {
        const isVideo = file.type.startsWith("video/");
        const limit = isVideo ? VIDEO_MAX : OTHER_MAX;
        const limitLabel = isVideo ? "100 MB" : "50 MB";

        if (file.size > limit) {
          toast.error(`${file.name} exceeds the ${limitLabel} size limit`);
          continue;
        }

        accepted.push(file);

        if (file.type.startsWith("image/")) {
          const url = URL.createObjectURL(file);
          objectUrlsRef.current.push(url);
          newPreviews.push(url);
        } else {
          newPreviews.push(null);
        }
      }

      if (incoming.length > available) {
        toast.error(`Only ${available} more file(s) can be added (max ${MAX_FILES})`);
      }

      setPreviews((p) => [...p, ...newPreviews]);
      setProgress((p) => [...p, ...accepted.map(() => 0)]);
      setErrors((p) => [...p, ...accepted.map(() => null)]);
      return [...prev, ...accepted];
    });
  }, []);

  const removeFile = useCallback((index) => {
    setFiles((prev) => {
      // Revoke object URL if present
      const url = objectUrlsRef.current[index];
      if (url) {
        URL.revokeObjectURL(url);
        objectUrlsRef.current.splice(index, 1);
      }
      return prev.filter((_, i) => i !== index);
    });
    setPreviews((p) => p.filter((_, i) => i !== index));
    setProgress((p) => p.filter((_, i) => i !== index));
    setErrors((p) => p.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    // Revoke all object URLs
    objectUrlsRef.current.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
    objectUrlsRef.current = [];
    setFiles([]);
    setPreviews([]);
    setProgress([]);
    setErrors([]);
    setUploading(false);
  }, []);

  /**
   * uploadFiles — never rejects.
   * Returns attachment[] for files that succeeded.
   * Failed files reflected in errors[] state.
   */
  const uploadFiles = useCallback(async () => {
    if (files.length === 0) return [];
    setUploading(true);

    // 1. Get presigned URLs for all files at once
    let presignResults;
    try {
      const body = files.map((f) => ({
        filename: f.name,
        contentType: f.type || "application/octet-stream",
        size: f.size,
      }));
      const { data } = await api.post("/api/upload/presign", body);
      presignResults = data;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to get upload URLs";
      toast.error(msg);
      setErrors(files.map(() => msg));
      setUploading(false);
      return [];
    }

    // 2. Upload each file in parallel via XHR (for progress tracking)
    const attachments = [];

    await Promise.all(
      files.map((file, i) => {
        return new Promise((resolve) => {
          const { presignedUrl, publicUrl, key } = presignResults[i];
          const effectiveContentType = file.type || "application/octet-stream";

          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100);
              setProgress((prev) => {
                const next = [...prev];
                next[i] = pct;
                return next;
              });
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const lastDot = file.name.lastIndexOf(".");
              const format = lastDot > 0 ? file.name.slice(lastDot + 1).toLowerCase() : "";
              attachments.push({
                url: publicUrl,
                publicId: key,
                name: file.name,
                size: file.size,
                resourceType: getResourceType(file.type),
                format,
              });
              setProgress((prev) => {
                const next = [...prev];
                next[i] = 100;
                return next;
              });
            } else {
              const msg = `Failed to upload ${file.name}`;
              setErrors((prev) => {
                const next = [...prev];
                next[i] = msg;
                return next;
              });
            }
            resolve();
          };

          xhr.onerror = () => {
            const msg = `Upload failed for ${file.name}`;
            setErrors((prev) => {
              const next = [...prev];
              next[i] = msg;
              return next;
            });
            resolve();
          };

          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", effectiveContentType);
          xhr.send(file);
        });
      })
    );

    setUploading(false);
    return attachments;
  }, [files]);

  return {
    files,
    previews,
    progress,
    uploading,
    errors,
    selectFiles,
    uploadFiles,
    removeFile,
    reset,
  };
}
