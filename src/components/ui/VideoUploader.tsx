import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { cloudinaryVideoUploadProvider, uploadVideo } from "../../infrastructure/uploads/videoUpload";
import type { VideoUploadProvider } from "../../infrastructure/uploads/videoUpload";
import "./VideoUploader.css";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["video/mp4", "video/webm"]);
const ACCEPTED_EXTENSIONS = /\.(mp4|webm)$/i;

interface PendingVideo {
  name: string;
  previewUrl: string;
  progress: number;
}

interface VideoUploaderProps {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  onUploadingChange?: (uploading: boolean) => void;
  provider?: VideoUploadProvider;
}

function VideoMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="13" height="14" rx="3" />
      <path d="m16 10 4.6-2.6a.7.7 0 0 1 1.1.6v8a.7.7 0 0 1-1.1.6L16 14" />
    </svg>
  );
}

function isAcceptedVideo(file: File): boolean {
  return ACCEPTED_TYPES.has(file.type) || (!file.type && ACCEPTED_EXTENSIONS.test(file.name));
}

export function VideoUploader({
  id,
  label,
  value,
  onChange,
  disabled = false,
  error,
  helpText = "MP4 o WebM. Máximo 50 MB. Duración recomendada: 30–60 s.",
  onUploadingChange,
  provider = cloudinaryVideoUploadProvider,
}: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingVideo | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);
  const busy = pending !== null;
  const messageId = `${id}-message`;
  const errorMessage = error || uploadError;

  const uploadFile = async (file: File) => {
    setUploadError("");
    if (!isAcceptedVideo(file)) {
      setUploadError(`${file.name}: usa un video MP4 o WebM.`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`${file.name}: supera el límite de 50 MB.`);
      return;
    }

    const preview = {
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
    };
    setPending(preview);
    onUploadingChange?.(true);

    try {
      const url = await uploadVideo(file, (progress) => {
        setPending((current) => (current ? { ...current, progress } : current));
      }, provider);
      onChange(url);
    } catch (reason) {
      setUploadError(reason instanceof Error ? reason.message : "No se pudo subir el video.");
    } finally {
      URL.revokeObjectURL(preview.previewUrl);
      setPending(null);
      onUploadingChange?.(false);
    }
  };

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? []);
    if (file) void uploadFile(file);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled || busy) return;
    const [file] = Array.from(event.dataTransfer.files);
    if (file) void uploadFile(file);
  };

  return (
    <section className="fg-video-uploader" aria-labelledby={`${id}-label`}>
      <h3 className="fg-video-uploader__label" id={`${id}-label`}>{label}</h3>
      <div
        className={`fg-video-uploader__dropzone${dragging ? " is-dragging" : ""}`}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled && !busy) setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setDragging(false);
        }}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id={id}
          className="fg-video-uploader__input"
          type="file"
          accept="video/mp4,video/webm"
          aria-label={label}
          tabIndex={-1}
          disabled={disabled || busy}
          aria-describedby={errorMessage ? `${messageId}-error` : `${messageId}-help`}
          onChange={handleSelect}
        />
        <VideoMark />
        <p>Arrastra un video aquí o</p>
        <button
          className="fg-video-uploader__select"
          type="button"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
        >
          {value ? "Reemplazar video" : "Seleccionar video"}
        </button>
        <small id={`${messageId}-help`}>{helpText}</small>
      </div>

      {errorMessage ? (
        <p className="fg-video-uploader__error" id={`${messageId}-error`} role="alert">
          {errorMessage}
        </p>
      ) : null}

      {pending ? (
        <div className="fg-video-uploader__pending" role="status">
          <video src={pending.previewUrl} muted preload="metadata" aria-hidden="true" tabIndex={-1} />
          <div>
            <span>{pending.name}</span>
            <progress max={100} value={pending.progress} aria-label={`Subiendo ${pending.name}`} />
            <small>{pending.progress}%</small>
          </div>
        </div>
      ) : null}

      {value ? (
        <ul className="fg-video-uploader__previews" aria-label={`${label}: video cargado`}>
          <li>
            <video src={value} controls preload="metadata" aria-label={`${label}: video cargado`} />
            <button
              type="button"
              aria-label={`Quitar el video de ${label}`}
              disabled={disabled || busy}
              onClick={() => onChange("")}
            >
              Quitar video
            </button>
          </li>
        </ul>
      ) : null}
    </section>
  );
}
