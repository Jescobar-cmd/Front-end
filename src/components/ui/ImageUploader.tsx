import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { cloudinaryImageUploadProvider, uploadImage } from "../../infrastructure/uploads/imageUpload";
import type { ImageUploadProvider } from "../../infrastructure/uploads/imageUpload";
import "./ImageUploader.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface PendingImage {
  id: string;
  name: string;
  previewUrl: string;
  progress: number;
}

interface ImageUploaderProps {
  id: string;
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  onUploadingChange?: (uploading: boolean) => void;
  provider?: ImageUploadProvider;
}

function ImageMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="8.5" cy="9" r="1.5" />
      <path d="m21 15-5-5L5 20" />
    </svg>
  );
}

export function ImageUploader({
  id,
  label,
  value,
  onChange,
  multiple = false,
  maxFiles = multiple ? 5 : 1,
  disabled = false,
  error,
  helpText = "JPG, PNG o WebP. Máximo 5 MB por imagen.",
  onUploadingChange,
  provider = cloudinaryImageUploadProvider,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);
  const busy = pending.length > 0;
  const messageId = `${id}-message`;
  const errorMessage = error || uploadError;

  const uploadFiles = async (files: FileList | File[]) => {
    setUploadError("");
    const remaining = Math.max(0, maxFiles - value.length);
    if (remaining === 0) {
      setUploadError(`Puedes cargar hasta ${maxFiles} ${maxFiles === 1 ? "imagen" : "imágenes"}.`);
      return;
    }

    const candidates = Array.from(files);
    const errors: string[] = [];
    const validFiles: File[] = [];

    if (candidates.length > remaining) {
      errors.push(`Solo puedes agregar ${remaining} ${remaining === 1 ? "imagen" : "imágenes"} más.`);
    }

    for (const file of candidates.slice(0, remaining)) {
      if (!ACCEPTED_TYPES.has(file.type)) {
        errors.push(`${file.name}: usa JPG, PNG o WebP.`);
      } else if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: supera el límite de 5 MB.`);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) setUploadError(errors.join(" "));
    if (validFiles.length === 0) return;

    const previews = validFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
    }));
    setPending(previews);
    onUploadingChange?.(true);

    const uploaded = [...value];
    try {
      for (let index = 0; index < validFiles.length; index += 1) {
        const url = await uploadImage(validFiles[index], (progress) => {
          setPending((current) =>
            current.map((image, imageIndex) =>
              imageIndex === index ? { ...image, progress } : image,
            ),
          );
        }, provider);
        uploaded.push(url);
        onChange([...uploaded]);
      }
    } catch (reason) {
      setUploadError(reason instanceof Error ? reason.message : "No se pudo subir la imagen.");
    } finally {
      previews.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setPending([]);
      onUploadingChange?.(false);
    }
  };

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) void uploadFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled && !busy) void uploadFiles(event.dataTransfer.files);
  };

  return (
    <section className="fg-image-uploader" aria-labelledby={`${id}-label`}>
      <h3 className="fg-image-uploader__label" id={`${id}-label`}>{label}</h3>
      <div
        className={`fg-image-uploader__dropzone${dragging ? " is-dragging" : ""}`}
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
          className="fg-image-uploader__input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          aria-label={label}
          tabIndex={-1}
          disabled={disabled || busy || value.length >= maxFiles}
          aria-describedby={errorMessage ? `${messageId}-error` : `${messageId}-help`}
          onChange={handleSelect}
        />
        <ImageMark />
        <p>Arrastra una imagen aquí o</p>
        <button
          className="fg-image-uploader__select"
          type="button"
          disabled={disabled || busy || value.length >= maxFiles}
          onClick={() => inputRef.current?.click()}
        >
          Seleccionar archivo{multiple ? "s" : ""}
        </button>
        <small id={`${messageId}-help`}>{helpText}</small>
      </div>

      {errorMessage ? (
        <p className="fg-image-uploader__error" id={`${messageId}-error`} role="alert">
          {errorMessage}
        </p>
      ) : null}

      {pending.map((image) => (
        <div className="fg-image-uploader__pending" key={image.id} role="status">
          <img src={image.previewUrl} alt={`Vista previa de ${image.name}`} />
          <div>
            <span>{image.name}</span>
            <progress max={100} value={image.progress} aria-label={`Subiendo ${image.name}`} />
            <small>{image.progress}%</small>
          </div>
        </div>
      ))}

      {value.length > 0 ? (
        <ul className="fg-image-uploader__previews" aria-label={`${label}: imágenes cargadas`}>
          {value.map((url, index) => (
            <li key={`${url}-${index}`}>
              <img src={url} alt={`${label}, imagen ${index + 1}`} />
              <button
                type="button"
                aria-label={`Quitar imagen ${index + 1} de ${label}`}
                disabled={disabled || busy}
                onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
