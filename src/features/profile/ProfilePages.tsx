import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Button, buttonClassName } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import type { Categoria } from "../../core/domain/entities/categoria";
import {
  NIVELES_HABILIDAD,
  type HabilidadSeleccionada,
  type NivelHabilidad,
} from "../../core/domain/entities/perfil";
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
    const field = detail.field.split(".")[0] || detail.field;
    errors[field] = errors[field] ? `${errors[field]} ${detail.message}` : detail.message;
    return errors;
  }, {});
}

function normalizarNivel(nivel: string | null): NivelHabilidad {
  return NIVELES_HABILIDAD.includes(nivel as NivelHabilidad)
    ? (nivel as NivelHabilidad)
    : "intermedio";
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
    <div className="profile-page">
      <header className="profile-heading">
        <p className="profile-eyebrow">MI CUENTA</p>
        <h1>{heading}</h1>
        <p>{description}</p>
      </header>
      {children}
    </div>
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
  help,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  help?: string;
  children: ReactNode;
}) {
  const errorId = `${name}-error`;
  const helpId = `${name}-help`;
  return (
    <label className="profile-field" htmlFor={name}>
      <span>{label}</span>
      {children}
      {help && <small className="profile-field-help" id={helpId}>{help}</small>}
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

function ProfilePreview({
  nombre,
  fotoPerfil,
  rol,
  email,
}: {
  nombre: string;
  fotoPerfil: string;
  rol: string;
  email: string;
}) {
  const inicial = nombre.trim().charAt(0).toLocaleUpperCase() || "F";
  return (
    <div className="profile-preview">
      {fotoPerfil.trim() ? (
        <img className="profile-preview__avatar" src={fotoPerfil.trim()} alt="" />
      ) : (
        <span className="profile-preview__avatar profile-preview__avatar--initial" aria-hidden="true">{inicial}</span>
      )}
      <div className="profile-preview__copy">
        <strong>{nombre.trim() || "Tu perfil"}</strong>
        <span>{rol}</span>
        <small>{email}</small>
      </div>
    </div>
  );
}

function ProfileOverview({
  nombre,
  fotoPerfil,
  rol,
  email,
  telefono,
  titulo,
  descripcion,
  nombreEmpresa,
  tipoCliente,
  habilidades,
  publicPath,
  onEdit,
}: {
  nombre: string;
  fotoPerfil: string;
  rol: string;
  email: string;
  telefono?: string;
  titulo?: string;
  descripcion?: string;
  nombreEmpresa?: string;
  tipoCliente?: string;
  habilidades?: string[];
  publicPath: string;
  onEdit: () => void;
}) {
  const inicial = nombre.trim().charAt(0).toLocaleUpperCase() || "F";
  const esFreelancer = rol === "Freelancer";

  return (
    <section className="profile-overview">
      <div className="profile-overview__cover" aria-hidden="true" />
      <div className="profile-overview__head">
        <div className="profile-overview__identity">
          {fotoPerfil.trim() ? (
            <img className="profile-overview__avatar" src={fotoPerfil.trim()} alt="" />
          ) : (
            <span className="profile-overview__avatar profile-overview__avatar--initial" aria-hidden="true">
              {inicial}
            </span>
          )}
          <div>
            <p className="ui-eyebrow">Tu perfil · {rol}</p>
            <h2>{nombre.trim() || "Tu perfil"}</h2>
            <p>{titulo?.trim() || (esFreelancer ? "Talento First Gig" : "Cliente First Gig")}</p>
            <div className="profile-overview__badges">
              <Badge tone="blue">Perfil público</Badge>
              {nombreEmpresa ? <Badge tone="blue">{nombreEmpresa}</Badge> : null}
              {tipoCliente ? <Badge>{tipoCliente === "empresa" ? "Empresa" : "Persona"}</Badge> : null}
            </div>
          </div>
        </div>
        <div className="profile-overview__actions">
          <Link className={buttonClassName({ variant: "secondary", size: "sm" })} to={publicPath}>
            Ver perfil público
          </Link>
          <Button variant="action" size="sm" onClick={onEdit}>
            Editar perfil
          </Button>
        </div>
      </div>

      <div className="profile-overview__grid">
        <section className="profile-overview__panel">
          <h3>Presentación</h3>
          <p>{descripcion?.trim() || (esFreelancer ? "Añade una biografía para que los clientes conozcan tu experiencia y forma de trabajar." : "Añade una descripción para que los freelancers entiendan tu proyecto y tu forma de trabajar.")}</p>
          {esFreelancer ? (
            <div className="profile-overview__portfolio">
              <div>
                <h3>Tu portafolio</h3>
                <p>Los servicios que publiques aparecerán en tu perfil público. El portafolio va primero.</p>
              </div>
              <Link className={buttonClassName({ variant: "primary", size: "sm" })} to="/dashboard/freelancer/servicios">
                Gestionar servicios
              </Link>
            </div>
          ) : null}
        </section>

        <aside className="profile-overview__panel">
          <h3>Datos de contacto</h3>
          <dl className="profile-overview__facts">
            <div><dt>Correo</dt><dd>{email}</dd></div>
            {telefono ? <div><dt>Teléfono</dt><dd>{telefono}</dd></div> : null}
            <div><dt>Rol</dt><dd>{rol}</dd></div>
          </dl>
        </aside>
      </div>

      {habilidades && habilidades.length > 0 ? (
        <section className="profile-overview__panel">
          <h3>Habilidades</h3>
          <div className="profile-overview__skills">
            {habilidades.map((habilidad) => (
              <Badge key={habilidad} tone="blue">{habilidad}</Badge>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

function useProfileToken() {
  const { token, user, actualizarNombre } = useAuth();
  return { token, user, actualizarNombre };
}

export function ClientProfilePage() {
  const { token, actualizarNombre } = useProfileToken();
  const [profile, setProfile] = useState<PerfilCliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState({
    nombre: "",
    telefono: "",
    fotoPerfil: "",
    descripcion: "",
    nombreEmpresa: "",
    tipoCliente: "natural" as "natural" | "empresa",
  });

  useEffect(() => {
    if (!saved) return;
    const timeout = window.setTimeout(() => setSaved(false), 5000);
    return () => window.clearTimeout(timeout);
  }, [saved]);

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
    setSaveError("");
    setSaved(false);
  };

  const resetValues = () => {
    if (!profile) return;
    setValues({
      nombre: profile.nombre ?? "",
      telefono: profile.telefono ?? "",
      fotoPerfil: profile.fotoPerfil ?? "",
      descripcion: profile.cliente.descripcion ?? "",
      nombreEmpresa: profile.cliente.nombreEmpresa ?? "",
      tipoCliente: profile.cliente.tipoCliente === "empresa" ? "empresa" : "natural",
    });
    setErrors({});
    setSaved(false);
    setSaveError("");
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
      setProfile((current) => current ? {
        ...current,
        nombre: values.nombre.trim(),
        telefono: values.telefono.trim() || null,
        fotoPerfil: values.fotoPerfil.trim() || null,
        cliente: {
          ...current.cliente,
          descripcion: values.descripcion.trim() || null,
          nombreEmpresa: values.nombreEmpresa.trim() || null,
          tipoCliente: values.tipoCliente,
        },
      } : current);
      actualizarNombre(values.nombre);
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
        <>
          {!editing && (
            <ProfileOverview
              nombre={values.nombre}
              fotoPerfil={values.fotoPerfil}
              rol="Cliente"
              email={profile.email}
              telefono={values.telefono}
              descripcion={values.descripcion}
              nombreEmpresa={values.nombreEmpresa}
              tipoCliente={values.tipoCliente}
              publicPath={`/perfil/${profile.id}`}
              onEdit={() => setEditing(true)}
            />
          )}
          <form className="profile-card profile-form" onSubmit={handleSubmit} noValidate hidden={!editing}>
          <div className="profile-layout">
            <div className="profile-main">
              <section className="profile-section-card">
                <header className="profile-section-heading">
                  <h2>Información del cliente</h2>
                  <p>Los datos que compartes con los freelancers.</p>
                </header>
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
              </section>
            </div>

            <aside className="profile-aside">
              <ProfilePreview nombre={values.nombre} fotoPerfil={values.fotoPerfil} rol="Cliente" email={profile.email} />
              <div className="profile-savebar">
                <ProfileFormStatus saving={saving} />
                <button className="profile-save" type="submit" disabled={saving}>
                  {saving ? "Guardando…" : "Guardar cambios"}
                </button>
                <button className="profile-cancel" type="button" disabled={saving} onClick={() => { resetValues(); setEditing(false); }}>
                  Cancelar
                </button>
              </div>
            </aside>
          </div>
          <ProfileFormToast
            saveError={saveError}
            saved={saved}
            onDismiss={() => {
              setSaveError("");
              setSaved(false);
            }}
          />
        </form>
        </>
      ) : null}
    </ProfileFrame>
  );
}

export function FreelancerProfilePage() {
  const { token, actualizarNombre } = useProfileToken();
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
  const [editing, setEditing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<HabilidadSeleccionada[]>([]);
  const [values, setValues] = useState({
    nombre: "",
    telefono: "",
    fotoPerfil: "",
    tituloProfesional: "",
    biografia: "",
  });

  useEffect(() => {
    if (!saved) return;
    const timeout = window.setTimeout(() => setSaved(false), 5000);
    return () => window.clearTimeout(timeout);
  }, [saved]);

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
        setSelectedSkills(
          data.freelancer.habilidades.map((skill) => ({
            id: skill.id,
            nivel: normalizarNivel(skill.nivel),
          })),
        );
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
    setSaveError("");
    setSaved(false);
  };

  const resetValues = () => {
    if (!profile) return;
    setValues({
      nombre: profile.nombre ?? "",
      telefono: profile.telefono ?? "",
      fotoPerfil: profile.fotoPerfil ?? "",
      tituloProfesional: profile.freelancer.tituloProfesional ?? "",
      biografia: profile.freelancer.biografia ?? "",
    });
    setSelectedSkills(
      profile.freelancer.habilidades.map((skill) => ({
        id: skill.id,
        nivel: normalizarNivel(skill.nivel),
      })),
    );
    setSelectedCategoryId(null);
    setErrors({});
    setSaved(false);
    setSaveError("");
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
        habilidades: selectedSkills.map((skill) => ({ id: skill.id, nivel: skill.nivel })),
      });
      setSaved(true);
      setProfile((current) => {
        if (!current) return current;
        const habilidades = selectedSkills.map(({ id: skillId, nivel }) => {
          const existente = current.freelancer.habilidades.find((skill) => skill.id === skillId);
          if (existente) return { ...existente, nivel: nivel ?? null };
          const catalogo = skills.find((skill) => skill.id === skillId);
          return { id: skillId, nombre: catalogo?.nombre ?? "Habilidad", nivel: nivel ?? null };
        });
        return {
          ...current,
          nombre: values.nombre.trim(),
          telefono: values.telefono.trim() || null,
          fotoPerfil: values.fotoPerfil.trim() || null,
          freelancer: {
            ...current.freelancer,
            tituloProfesional: values.tituloProfesional.trim() || null,
            biografia: values.biografia.trim() || null,
            habilidades,
          },
        };
      });
      actualizarNombre(values.nombre);
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
        <>
          {!editing && (
            <ProfileOverview
              nombre={values.nombre}
              fotoPerfil={values.fotoPerfil}
              rol="Freelancer"
              email={profile.email}
              telefono={values.telefono}
              titulo={values.tituloProfesional}
              descripcion={values.biografia}
              habilidades={profile.freelancer.habilidades.map((habilidad) => habilidad.nombre)}
              publicPath={`/perfil/${profile.id}`}
              onEdit={() => setEditing(true)}
            />
          )}
          <form className="profile-card profile-form" onSubmit={handleSubmit} noValidate hidden={!editing}>
          <div className="profile-layout">
            <div className="profile-main">
              <section className="profile-section-card">
                <header className="profile-section-heading">
                  <h2>Perfil y contacto</h2>
                  <p>Cuéntales quién eres y cómo pueden contactarte.</p>
                </header>
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
              </section>
              <section className="profile-section-card profile-section-card--skills">
                <header className="profile-section-heading">
                  <h2>Habilidades</h2>
                  <p>Elige las habilidades que quieres mostrar en tu perfil.</p>
                </header>
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
                    selectedSkills={selectedSkills}
                    disabled={saving}
                    error={errors.habilidades}
                    onCategoryChange={setSelectedCategoryId}
                    onSkillsChange={(nextSkills) => {
                      setSelectedSkills(nextSkills);
                      setErrors((current) => ({ ...current, habilidades: "" }));
                      setSaveError("");
                      setSaved(false);
                    }}
                  />
                )}
              </section>
            </div>

            <aside className="profile-aside">
              <ProfilePreview nombre={values.nombre} fotoPerfil={values.fotoPerfil} rol="Freelancer" email={profile.email} />
              <div className="profile-savebar">
                <ProfileFormStatus saving={saving} />
                <button className="profile-save" type="submit" disabled={saving || catalogLoading || Boolean(catalogError)}>
                  {saving ? "Guardando…" : "Guardar cambios"}
                </button>
                <button className="profile-cancel" type="button" disabled={saving} onClick={() => { resetValues(); setEditing(false); }}>
                  Cancelar
                </button>
              </div>
            </aside>
          </div>
          <ProfileFormToast
            saveError={saveError}
            saved={saved}
            onDismiss={() => {
              setSaveError("");
              setSaved(false);
            }}
          />
        </form>
        </>
      ) : null}
    </ProfileFrame>
  );
}

function ProfileFormStatus({ saving }: { saving: boolean }) {
  return (
    <div className="profile-status" aria-live="polite">
      {saving && <p className="profile-message">Guardando tus cambios…</p>}
    </div>
  );
}

function ProfileFormToast({
  saveError,
  saved,
  onDismiss,
}: {
  saveError: string;
  saved: boolean;
  onDismiss: () => void;
}) {
  if (!saveError && !saved) return null;
  return (
    <div
      className={`profile-toast${saveError ? " profile-toast--error" : " profile-toast--success"}`}
      role={saveError ? "alert" : "status"}
      aria-live={saveError ? "assertive" : "polite"}
    >
      <span>{saveError || "Cambios guardados correctamente."}</span>
      <button type="button" aria-label="Cerrar notificación" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}
