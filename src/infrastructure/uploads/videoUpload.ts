interface CloudinaryResponse {
  secure_url?: string;
  error?: { message?: string };
}

export type UploadProgressHandler = (progress: number) => void;

export interface VideoUploadProvider {
  upload(file: File, onProgress?: UploadProgressHandler): Promise<string>;
}

function cloudinaryConfig() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
  const uploadPreset =
    import.meta.env.VITE_CLOUDINARY_VIDEO_UPLOAD_PRESET?.trim() ||
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();
  if (!cloudName || !uploadPreset) {
    throw new Error("Configura Cloudinary antes de subir videos.");
  }
  if (!/^[a-z0-9_-]+$/i.test(cloudName)) {
    throw new Error("El nombre de Cloudinary no es válido.");
  }
  return { cloudName, uploadPreset };
}

function parseResponse(responseText: string): CloudinaryResponse | null {
  try {
    return JSON.parse(responseText) as CloudinaryResponse;
  } catch {
    return null;
  }
}

function uploadErrorMessage(message: string | undefined): string {
  const detail = message?.trim() || "Cloudinary no pudo subir el video.";
  if (/not allowed/i.test(detail)) {
    return `${detail} Habilita MP4 y WebM en el preset de Cloudinary.`;
  }
  return detail;
}

export const cloudinaryVideoUploadProvider: VideoUploadProvider = {
  upload(file, onProgress) {
    const { cloudName, uploadPreset } = cloudinaryConfig();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      );

      request.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          onProgress?.(Math.round((event.loaded / event.total) * 100));
        }
      });

      request.addEventListener("load", () => {
        const response = parseResponse(request.responseText);
        if (request.status < 200 || request.status >= 300) {
          reject(new Error(uploadErrorMessage(response?.error?.message)));
          return;
        }
        if (!response?.secure_url || !response.secure_url.startsWith("https://")) {
          reject(new Error("Cloudinary respondió sin una URL segura."));
          return;
        }
        resolve(response.secure_url);
      });

      request.addEventListener("error", () => {
        reject(new Error("No se pudo conectar con Cloudinary. Revisa tu conexión e inténtalo de nuevo."));
      });
      request.addEventListener("abort", () => {
        reject(new Error("La subida del video se canceló."));
      });
      request.send(formData);
    });
  },
};

export function uploadVideo(
  file: File,
  onProgress?: UploadProgressHandler,
  provider: VideoUploadProvider = cloudinaryVideoUploadProvider,
): Promise<string> {
  return provider.upload(file, onProgress);
}
