import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { OfferForm, ServiceForm, useCatalogs } from "./index";
import "./services-offers.css";

function CreateShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="so-page">
      <header className="so-heading so-heading--compact">
        <p className="so-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
    </div>
  );
}

function WithoutSession() {
  return (
    <div className="so-page">
      <div className="so-alert" role="alert">Inicia sesión para continuar.</div>
    </div>
  );
}

function CatalogsState({
  loading,
  error,
  onRetry,
}: {
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  if (loading) return <p className="so-empty" role="status">Cargando categorías y habilidades…</p>;
  if (!error) return null;
  return (
    <div className="so-alert" role="alert">
      <span>{error}</span>
      <button className="so-button so-button--quiet" type="button" onClick={onRetry}>Reintentar</button>
    </div>
  );
}

function SuccessPanel({
  title,
  description,
  listPath,
  listLabel,
  onCreateAnother,
}: {
  title: string;
  description: string;
  listPath: string;
  listLabel: string;
  onCreateAnother: () => void;
}) {
  return (
    <section className="so-card so-create-success" role="status">
      <span className="so-create-success__mark" aria-hidden="true">✓</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="so-form__actions">
        <button className="so-button so-button--quiet" type="button" onClick={onCreateAnother}>Crear otro</button>
        <Link className="so-button so-button--primary" to={listPath}>{listLabel}</Link>
      </div>
    </section>
  );
}

function CreateProjectContent({ token }: { token: string }) {
  const navigate = useNavigate();
  const catalogs = useCatalogs(token);
  const [published, setPublished] = useState(false);

  return (
    <CreateShell
      eyebrow="NUEVO PROYECTO"
      title="Publica lo que necesitas"
      description="Describe el trabajo, define un presupuesto y recibe propuestas de freelancers."
    >
      <CatalogsState loading={catalogs.loading} error={catalogs.error} onRetry={catalogs.retry} />
      {!catalogs.loading && !catalogs.error && (
        published ? (
          <SuccessPanel
            title="Proyecto publicado"
            description="Tu proyecto ya está disponible para recibir propuestas."
            listPath="/dashboard/cliente/ofertas"
            listLabel="Ver mis proyectos"
            onCreateAnother={() => setPublished(false)}
          />
        ) : (
          <section className="so-card so-create">
            <OfferForm
              token={token}
              categories={catalogs.categories}
              skills={catalogs.skills}
              onSaved={() => setPublished(true)}
              onCancel={() => navigate("/dashboard/cliente/ofertas")}
            />
          </section>
        )
      )}
    </CreateShell>
  );
}

function CreateServiceContent({ token }: { token: string }) {
  const navigate = useNavigate();
  const catalogs = useCatalogs(token);
  const [published, setPublished] = useState(false);

  return (
    <CreateShell
      eyebrow="NUEVO SERVICIO"
      title="Ofrece lo que sabes hacer"
      description="Publica un servicio claro para que los clientes puedan encontrarte y escribirte."
    >
      <CatalogsState loading={catalogs.loading} error={catalogs.error} onRetry={catalogs.retry} />
      {!catalogs.loading && !catalogs.error && (
        published ? (
          <SuccessPanel
            title="Servicio publicado"
            description="Tu servicio ya aparece en el catálogo de FirstGig."
            listPath="/dashboard/freelancer/servicios"
            listLabel="Ver mis servicios"
            onCreateAnother={() => setPublished(false)}
          />
        ) : (
          <section className="so-card so-create">
            <ServiceForm
              token={token}
              categories={catalogs.categories}
              onSaved={() => setPublished(true)}
              onCancel={() => navigate("/dashboard/freelancer/servicios")}
            />
          </section>
        )
      )}
    </CreateShell>
  );
}

export function CreateProjectPage() {
  const { user, token, refrescarSesion, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [refreshError, setRefreshError] = useState("");
  if (!token || !user) return <WithoutSession />;
  if (user.rol !== "cliente") {
    return (
      <div className="so-page">
        <div className="so-alert" role="alert">
          <p>
            Esta acción es solo para clientes. Tu sesión actual indica el rol <strong>{user.rol === "freelancer" ? "freelancer" : user.rol}</strong>.
          </p>
          <p>Si tu cuenta sí es de cliente, actualiza la sesión (puede estar desactualizada) o vuelve a iniciar sesión.</p>
          {refreshError ? <p className="so-inline-error">{refreshError}</p> : null}
          <div className="so-form__actions">
            <button
              className="so-button so-button--quiet"
              type="button"
              onClick={async () => {
                setRefreshError("");
                try {
                  await refrescarSesion();
                } catch (e) {
                  setRefreshError(e instanceof Error ? e.message : "No se pudo actualizar la sesión.");
                }
              }}
            >
              Actualizar sesión
            </button>
            <button className="so-button so-button--outline" type="button" onClick={() => { cerrarSesion(); navigate("/login", { replace: true }); }}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }
  return <CreateProjectContent token={token} />;
}

export function CreateServicePage() {
  const { user, token, refrescarSesion, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [refreshError, setRefreshError] = useState("");
  if (!token || !user) return <WithoutSession />;
  if (user.rol !== "freelancer") {
    return (
      <div className="so-page">
        <div className="so-alert" role="alert">
          <p>
            Esta acción es solo para freelancers. Tu sesión actual indica el rol <strong>{user.rol === "cliente" ? "cliente" : user.rol}</strong>.
          </p>
          <p>Si tu cuenta sí es de freelancer, actualiza la sesión (puede estar desactualizada) o vuelve a iniciar sesión.</p>
          {refreshError ? <p className="so-inline-error">{refreshError}</p> : null}
          <div className="so-form__actions">
            <button
              className="so-button so-button--quiet"
              type="button"
              onClick={async () => {
                setRefreshError("");
                try {
                  await refrescarSesion();
                } catch (e) {
                  setRefreshError(e instanceof Error ? e.message : "No se pudo actualizar la sesión.");
                }
              }}
            >
              Actualizar sesión
            </button>
            <button className="so-button so-button--outline" type="button" onClick={() => { cerrarSesion(); navigate("/login", { replace: true }); }}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }
  return <CreateServiceContent token={token} />;
}
