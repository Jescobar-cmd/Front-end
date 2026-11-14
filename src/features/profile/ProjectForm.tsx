import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import type {
  DatosProyectoPortafolio,
  PortfolioProject,
} from "../../core/domain/entities/perfilProfesional";

interface ProjectFormProps {
  initial?: PortfolioProject | null;
  saving: boolean;
  error?: string;
  onCancel: () => void;
  onSubmit: (datos: DatosProyectoPortafolio) => void;
}

type Values = {
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  enlaceUrl: string;
};

type Errors = Partial<Record<keyof Values, string>>;

function initialValues(project?: PortfolioProject | null): Values {
  return {
    titulo: project?.titulo ?? "",
    descripcion: project?.descripcion ?? "",
    imagenUrl: project?.portada ?? "",
    enlaceUrl: project?.enlace ?? "",
  };
}

function urlError(value: string): string | undefined {
  if (!value.trim()) return undefined;
  if (value.trim().length > 500) return "La URL no puede superar 500 caracteres.";
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "Usa una URL que empiece por http:// o https://.";
    }
  } catch {
    return "Ingresa una URL válida.";
  }
  return undefined;
}

export function ProjectForm({ initial, saving, error, onCancel, onSubmit }: ProjectFormProps) {
  const [values, setValues] = useState<Values>(() => initialValues(initial));
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    setValues(initialValues(initial));
    setErrors({});
  }, [initial]);

  const update = (name: keyof Values, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Errors = {};
    const titulo = values.titulo.trim();
    const descripcion = values.descripcion.trim();

    if (!titulo) nextErrors.titulo = "El título es obligatorio.";
    else if (titulo.length < 3) nextErrors.titulo = "El título debe tener al menos 3 caracteres.";
    else if (titulo.length > 150) nextErrors.titulo = "El título no puede superar 150 caracteres.";
    if (descripcion.length > 1000) {
      nextErrors.descripcion = "La descripción no puede superar 1000 caracteres.";
    }
    const imagenError = urlError(values.imagenUrl);
    if (imagenError) nextErrors.imagenUrl = imagenError;
    const enlaceError = urlError(values.enlaceUrl);
    if (enlaceError) nextErrors.enlaceUrl = enlaceError;

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      titulo,
      descripcion: descripcion || null,
      imagenUrl: values.imagenUrl.trim() || null,
      enlaceUrl: values.enlaceUrl.trim() || null,
    });
  };

  return (
    <form className="pp-form-panel" onSubmit={handleSubmit} noValidate>
      <div className="pp-form-panel__head">
        <div>
          <p className="pp-eyebrow">Portafolio</p>
          <h3>{initial ? "Editar proyecto" : "Agregar proyecto"}</h3>
        </div>
      </div>

      {error ? <p className="pp-form-error" role="alert">{error}</p> : null}

      <div className="pp-form-grid">
        <label className="pp-field pp-field--full">
          <span>Título del proyecto</span>
          <input
            type="text"
            name="titulo"
            required
            maxLength={150}
            value={values.titulo}
            disabled={saving}
            aria-invalid={Boolean(errors.titulo)}
            aria-describedby={errors.titulo ? "proyecto-titulo-error" : "proyecto-titulo-help"}
            onChange={(event) => update("titulo", event.target.value)}
          />
          {errors.titulo ? (
            <small className="pp-field__error" id="proyecto-titulo-error">{errors.titulo}</small>
          ) : (
            <small className="pp-field__help" id="proyecto-titulo-help">
              {values.titulo.length}/150 caracteres
            </small>
          )}
        </label>

        <label className="pp-field pp-field--full">
          <span>Descripción</span>
          <textarea
            name="descripcion"
            rows={5}
            maxLength={1000}
            value={values.descripcion}
            disabled={saving}
            aria-invalid={Boolean(errors.descripcion)}
            aria-describedby={errors.descripcion ? "proyecto-descripcion-error" : "proyecto-descripcion-help"}
            onChange={(event) => update("descripcion", event.target.value)}
          />
          {errors.descripcion ? (
            <small className="pp-field__error" id="proyecto-descripcion-error">{errors.descripcion}</small>
          ) : (
            <small className="pp-field__help" id="proyecto-descripcion-help">
              Explica el contexto, tu proceso y el resultado. {values.descripcion.length}/1000 caracteres.
            </small>
          )}
        </label>

        <label className="pp-field">
          <span>URL de la imagen de portada</span>
          <input
            type="url"
            name="imagenUrl"
            inputMode="url"
            maxLength={500}
            placeholder="https://res.cloudinary.com/…"
            value={values.imagenUrl}
            disabled={saving}
            aria-invalid={Boolean(errors.imagenUrl)}
            aria-describedby={errors.imagenUrl ? "proyecto-imagen-error" : "proyecto-imagen-help"}
            onChange={(event) => update("imagenUrl", event.target.value)}
          />
          {errors.imagenUrl ? (
            <small className="pp-field__error" id="proyecto-imagen-error">{errors.imagenUrl}</small>
          ) : (
            <small className="pp-field__help" id="proyecto-imagen-help">
              Imagen alojada en Cloudinary u otro servicio.
            </small>
          )}
        </label>

        <label className="pp-field">
          <span>Enlace del proyecto</span>
          <input
            type="url"
            name="enlaceUrl"
            inputMode="url"
            maxLength={500}
            placeholder="https://mi-proyecto.com"
            value={values.enlaceUrl}
            disabled={saving}
            aria-invalid={Boolean(errors.enlaceUrl)}
            aria-describedby={errors.enlaceUrl ? "proyecto-enlace-error" : "proyecto-enlace-help"}
            onChange={(event) => update("enlaceUrl", event.target.value)}
          />
          {errors.enlaceUrl ? (
            <small className="pp-field__error" id="proyecto-enlace-error">{errors.enlaceUrl}</small>
          ) : (
            <small className="pp-field__help" id="proyecto-enlace-help">
              Opcional. Se abre en una pestaña nueva.
            </small>
          )}
        </label>
      </div>

      <div className="pp-form-actions">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="action" type="submit" disabled={saving}>
          {saving ? "Guardando…" : initial ? "Guardar cambios" : "Agregar proyecto"}
        </Button>
      </div>
    </form>
  );
}