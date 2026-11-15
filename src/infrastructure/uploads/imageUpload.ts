interface CloudinaryResponse {
  secure_url?: string;
  error?: { message?: string };
}

export type UploadProgressHandler = (progress: number) => void;

export interface ImageUploadProvider {
  upload(file: File, onProgress?: UploadProgressHandler): Promise<string>;
}

function cloudinaryConfig() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();
  if (!cloudName || !uploadPreset) {
    throw new Error("Configura Cloudinary antes de subir imágenes.");
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

export const cloudinaryImageUploadProvider: ImageUploadProvider = {
  upload(file, onProgress) {
    const { cloudName, uploadPreset } = cloudinaryConfig();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      );

      request.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          onProgress?.(Math.round((event.loaded / event.total) * 100));
        }
      });

      request.addEventListener("load", () => {
        const response = parseResponse(request.responseText);
        if (request.status < 200 || request.status >= 300) {
          reject(new Error(response?.error?.message ?? "Cloudinary no pudo subir la imagen."));
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
        reject(new Error("La subida de la imagen se canceló."));
      });
      request.send(formData);
    });
  },
};

export function uploadImage(
  file: File,
  onProgress?: UploadProgressHandler,
  provider: ImageUploadProvider = cloudinaryImageUploadProvider,
): Promise<string> {
  return provider.upload(file, onProgress);
}
