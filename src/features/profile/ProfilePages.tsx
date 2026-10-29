import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import type { Categoria } from "../../core/domain/entities/categoria";
import { getCategories, getSkills } from "../../infrastructure/api/apiCatalogos";
import {
  getClientProfile,
  getFreelancerProfile,
  updateClientProfile,
  updateFreelancerProfile,
} from "../../infrastructure/api/apiPerfiles";
import type { ApiError } from "../../infrastructure/api/client";
import type { PerfilCliente, PerfilFreelancer } from "../../infrastructure/api/apiPerfiles";
import { CategorySkillSelector } from "./CategorySkillSelector";
import type { HabilidadCatalogo } from "./CategorySkillSelector";
import "./profile.css";

type FieldErrors = Record<string, string>;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}

function fieldErrors(error: unknown): FieldErrors {
  const details = (error as ApiError | undefined)?.details;
  if (!details?.length) return {};
  return details.reduce<FieldErrors>((errors, detail) => {
    errors[detail.field] = errors[detail.field] ? `${errors[detail.field]} ${detail.message}` : detail.message;
    return errors;
  }, {});
}

function httpsUrlError(value: string): string | undefined {
  if (!value.trim()) return undefined;
  try {
    if (new URL(value).protocol !== "https:") return "La foto debe usar una dirección HTTPS.";
  } catch {
    return "Ingresa una URL válida para la foto.";
  }
  return undefined;
}

function ProfileFrame({ heading, description, children }: { heading: string; description: string; children: ReactNode }) {
  return (
    <main className="profile-page">
      <header className="profile-heading">
        <p className="profile-eyebrow">MI CUENTA</p>
        <h1>{heading}</h1>
        <p>{description}</p>
      </header>
      {children}
    </main>
  );
}

function ProfileLoading() {
  return (
    <div className="profile-message" role="status">
      Cargando perfil…
    </div>
  );
}

function ProfileLoadError({ message }: { message: string }) {
  return (
    <div className="profile-message profile-message--error" role="alert">
      {message}
    </div>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: ReactNode;
}) {
  const errorId = `${name}-error`;
  return (
    <label className="profile-field" htmlFor={name}>
      <span>{label}</span>
      {children}
      {error && (
        <span className="profile-field-error" id={errorId} role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

function AccountEmail({ email }: { email: string }) {
  return (
    <div className="profile-field">
      <span>Correo de la cuenta</span>
      <output>{email}</output>
      <small>El correo no se puede cambiar desde el perfil.</small>
    </div>
  );
}

function PhotoUrlField({
  value,
  error,
  disabled,
  onChange,
}: {
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <Field label="URL de foto de perfil" name="fotoPerfil" error={error}>
      <input
        id="fotoPerfil"
        name="fotoPerfil"
        type="url"
        inputMode="url"
        autoComplete="url"
        placeholder="https://ejemplo.com/mi-foto.jpg"
        value={value}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "fotoPerfil-error" : "fotoPerfil-help"}
        onChange={(event) => onChange(event.target.value)}
      />
      {!error && <small id="fotoPerfil-help">Usa una URL HTTPS. La carga de archivos no está disponible.</small>}
    </Field>
  );
}

function useProfileToken() {
  const { token, user } = useAuth();
  return { token, user };
}

export function ClientProfilePage() {
  const { token, user } = useProfileToken();
  const [profile, setProfile] = useState<PerfilCliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState({
    nombre: "",
    telefono: "",
    fotoPerfil: "",
    descripcion: "",
    nombreEmpresa: "",
    tipoCliente: "natural" as "natural" | "empresa",
  });

  useEffect(() => {
    let active = true;
    if (!token) {
      setLoadError("Inicia sesión para ver tu perfil.");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    getClientProfile(token)
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setValues({
          nombre: data.nombre ?? "",
          telefono: data.telefono ?? "",
          fotoPerfil: data.fotoPerfil ?? "",
          descripcion: data.cliente.descripcion ?? "",
          nombreEmpresa: data.cliente.nombreEmpresa ?? "",
          tipoCliente: data.cliente.tipoCliente === "empresa" ? "empresa" : "natural",
        });
      })
      .catch((error: unknown) => {
        if (active) setLoadError(errorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const updateValue = (name: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSaved(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    const photoError = httpsUrlError(values.fotoPerfil);
    if (photoError) {
      setErrors({ fotoPerfil: photoError });
      return;
    }

    setSaving(true);
    setSaved(false);
    setSaveError("");
    setErrors({});
    try {
      await updateClientProfile(token, {
        nombre: values.nombre.trim(),
        telefono: values.telefono.trim() || null,
        fotoPerfil: values.fotoPerfil.trim() || null,
        descripcion: values.descripcion.trim() || null,
        nombreEmpresa: values.nombreEmpresa.trim() || null,
        tipoCliente: values.tipoCliente,
      });
      setSaved(true);
      setProfile((current) => (current ? { ...current, nombre: values.nombre.trim() } : current));
    } catch (error) {
      setErrors(fieldErrors(error));
      setSaveError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProfileFrame heading="Perfil de cliente" description="Administra la información que compartes con freelancers.">
      {loading ? (
        <ProfileLoading />
      ) : loadError ? (
        <ProfileLoadError message={loadError} />
      ) : profile ? (
        <form className="profile-card" onSubmit={handleSubmit} noValidate>
          <div className="profile-grid">
            <Field label="Nombre" name="nombre" error={errors.nombre}>
              <input
                id="nombre"
                name="nombre"
                autoComplete="name"
                required
                value={values.nombre}
                disabled={saving}
                aria-invalid={Boolean(errors.nombre)}
                aria-describedby={errors.nombre ? "nombre-error" : undefined}
                onChange={(event) => updateValue("nombre", event.target.value)}
              />
            </Field>
            <AccountEmail email={profile.email} />
            <Field label="Teléfono" name="telefono" error={errors.telefono}>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                autoComplete="tel"
                value={values.telefono}
                disabled={saving}
                aria-invalid={Boolean(errors.telefono)}
                aria-describedby={errors.telefono ? "telefono-error" : undefined}
                onChange={(event) => updateValue("telefono", event.target.value)}
              />
            </Field>
            <PhotoUrlField
              value={values.fotoPerfil}
              error={errors.fotoPerfil}
              disabled={saving}
              onChange={(value) => updateValue("fotoPerfil", value)}
            />
            <Field label="Tipo de cliente" name="tipoCliente" error={errors.tipoCliente}>
              <select
                id="tipoCliente"
                name="tipoCliente"
                value={values.tipoCliente}
                disabled={saving}
                aria-invalid={Boolean(errors.tipoCliente)}
                aria-describedby={errors.tipoCliente ? "tipoCliente-error" : undefined}
                onChange={(event) => updateValue("tipoCliente", event.target.value)}
              >
                <option value="natural">Persona</option>
                <option value="empresa">Empresa</option>
              </select>
            </Field>
            <Field label="Nombre de empresa" name="nombreEmpresa" error={errors.nombreEmpresa}>
              <input
                id="nombreEmpresa"
                name="nombreEmpresa"
                autoComplete="organization"
                value={values.nombreEmpresa}
                disabled={saving}
                aria-invalid={Boolean(errors.nombreEmpresa)}
                aria-describedby={errors.nombreEmpresa ? "nombreEmpresa-error" : undefined}
                onChange={(event) => updateValue("nombreEmpresa", event.target.value)}
              />
            </Field>
            <Field label="Descripción" name="descripcion" error={errors.descripcion}>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={5}
                value={values.descripcion}
                disabled={saving}
                aria-invalid={Boolean(errors.descripcion)}
                aria-describedby={errors.descripcion ? "descripcion-error" : undefined}
                onChange={(event) => updateValue("descripcion", event.target.value)}
              />
            </Field>
          </div>
          <ProfileFormStatus saveError={saveError} saved={saved} saving={saving} />
          <button className="profile-save" type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      ) : null}
    </ProfileFrame>
  );
}

export function FreelancerProfilePage() {
  const { token } = useProfileToken();
  const [profile, setProfile] = useState<PerfilFreelancer | null>(null);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [skills, setSkills] = useState<HabilidadCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [catalogError, setCatalogError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saved, setSaved] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [values, setValues] = useState({
    nombre: "",
    telefono: "",
    fotoPerfil: "",
    tituloProfesional: "",
    biografia: "",
  });

  useEffect(() => {
    let active = true;
    if (!token) {
      setLoadError("Inicia sesión para ver tu perfil.");
      setLoading(false);
      setCatalogLoading(false);
      return () => {
        active = false;
      };
    }

    getFreelancerProfile(token)
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setValues({
          nombre: data.nombre ?? "",
          telefono: data.telefono ?? "",
          fotoPerfil: data.fotoPerfil ?? "",
          tituloProfesional: data.freelancer.tituloProfesional ?? "",
          biografia: data.freelancer.biografia ?? "",
        });
        setSelectedSkillIds(data.freelancer.habilidades.map((skill) => skill.id));
      })
      .catch((error: unknown) => {
        if (active) setLoadError(errorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    Promise.all([getCategories(token), getSkills(token)])
      .then(([categoryData, skillData]) => {
        if (!active) return;
        setCategories(categoryData);
        setSkills(skillData);
      })
      .catch((error: unknown) => {
        if (active) setCatalogError(errorMessage(error));
      })
      .finally(() => {
        if (active) setCatalogLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const updateValue = (name: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSaved(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    const photoError = httpsUrlError(values.fotoPerfil);
    if (photoError) {
      setErrors({ fotoPerfil: photoError });
      return;
    }
    if (catalogError || catalogLoading) return;

    setSaving(true);
    setSaved(false);
    setSaveError("");
    setErrors({});
    try {
      await updateFreelancerProfile(token, {
        nombre: values.nombre.trim(),
        telefono: values.telefono.trim() || null,
        fotoPerfil: values.fotoPerfil.trim() || null,
        tituloProfesional: values.tituloProfesional.trim() || null,
        biografia: values.biografia.trim() || null,
        habilidadIds: selectedSkillIds,
      });
      setSaved(true);
      setProfile((current) => (current ? { ...current, nombre: values.nombre.trim() } : current));
    } catch (error) {
      setErrors(fieldErrors(error));
      setSaveError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProfileFrame heading="Perfil de freelancer" description="Presenta tu experiencia y las habilidades que ofreces.">
      {loading ? (
        <ProfileLoading />
      ) : loadError ? (
        <ProfileLoadError message={loadError} />
      ) : profile ? (
        <form className="profile-card" onSubmit={handleSubmit} noValidate>
          <div className="profile-grid">
            <Field label="Nombre" name="nombre" error={errors.nombre}>
              <input
                id="nombre"
                name="nombre"
                autoComplete="name"
                required
                value={values.nombre}
                disabled={saving}
                aria-invalid={Boolean(errors.nombre)}
                aria-describedby={errors.nombre ? "nombre-error" : undefined}
                onChange={(event) => updateValue("nombre", event.target.value)}
              />
            </Field>
            <AccountEmail email={profile.email} />
            <Field label="Teléfono" name="telefono" error={errors.telefono}>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                autoComplete="tel"
                value={values.telefono}
                disabled={saving}
                aria-invalid={Boolean(errors.telefono)}
                aria-describedby={errors.telefono ? "telefono-error" : undefined}
                onChange={(event) => updateValue("telefono", event.target.value)}
              />
            </Field>
            <PhotoUrlField
              value={values.fotoPerfil}
              error={errors.fotoPerfil}
              disabled={saving}
              onChange={(value) => updateValue("fotoPerfil", value)}
            />
            <Field label="Título profesional" name="tituloProfesional" error={errors.tituloProfesional}>
              <input
                id="tituloProfesional"
                name="tituloProfesional"
                value={values.tituloProfesional}
                disabled={saving}
                aria-invalid={Boolean(errors.tituloProfesional)}
                aria-describedby={errors.tituloProfesional ? "tituloProfesional-error" : undefined}
                onChange={(event) => updateValue("tituloProfesional", event.target.value)}
              />
            </Field>
            <Field label="Biografía" name="biografia" error={errors.biografia}>
              <textarea
                id="biografia"
                name="biografia"
                rows={5}
                value={values.biografia}
                disabled={saving}
                aria-invalid={Boolean(errors.biografia)}
                aria-describedby={errors.biografia ? "biografia-error" : undefined}
                onChange={(event) => updateValue("biografia", event.target.value)}
              />
            </Field>
          </div>
          {catalogError ? (
            <div className="profile-message profile-message--error" role="alert">
              No se pudieron cargar las categorías y habilidades: {catalogError}
            </div>
          ) : catalogLoading ? (
            <div className="profile-message" role="status">
              Cargando categorías y habilidades…
            </div>
          ) : (
            <CategorySkillSelector
              categories={categories}
              skills={skills}
              selectedCategoryId={selectedCategoryId}
              selectedSkillIds={selectedSkillIds}
              disabled={saving}
              error={errors.habilidadIds}
              onCategoryChange={setSelectedCategoryId}
              onSkillsChange={(skillIds) => {
                setSelectedSkillIds(skillIds);
                setErrors((current) => ({ ...current, habilidadIds: "" }));
                setSaved(false);
              }}
            />
          )}
          <ProfileFormStatus saveError={saveError} saved={saved} saving={saving} />
          <button className="profile-save" type="submit" disabled={saving || catalogLoading || Boolean(catalogError)}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      ) : null}
    </ProfileFrame>
  );
}

function ProfileFormStatus({ saveError, saved, saving }: { saveError: string; saved: boolean; saving: boolean }) {
  return (
    <div className="profile-status" aria-live="polite">
      {saveError && (
        <p className="profile-message profile-message--error" role="alert">
          {saveError}
        </p>
      )}
      {saved && !saving && <p className="profile-message profile-message--success">Cambios guardados correctamente.</p>}
    </div>
  );
}
