import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/button";
import { Input } from "../../../components/input";
import { Spinner } from "../../../components/spinner";
import { useLogin } from "../../../hooks/UserLogin";
import { useGoogleLogin } from "../../../hooks/useGoogleLogin";
import { useAuth } from "../../../context/AuthContext";
import type { ResultadoGoogle } from "../../../core/application/ports/AuthRepositoryPort";
import { loginConGoogleUseCase } from "../../../di/container";
import { Brand } from "../../../components/Brand";
import { GoogleLogo } from "../../../components/GoogleLogo";
import { dashboardPorRol } from "../../../routes/rutasPorRol";

const GOOGLE_PENDIENTE_KEY = "first_gig_google_pendiente";
const ROL_INTENT_KEY = "first_gig_rol_intent";

type RolGoogle = "cliente" | "freelancer";

interface GooglePendiente {
  credential: string;
  email: string;
}

function correoDesdeIdToken(credential: string): string {
  try {
    const payload = credential.split(".")[1];
    if (!payload) return "";
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const data = JSON.parse(atob(padded)) as { email?: unknown };
    return typeof data.email === "string" ? data.email : "";
  } catch {
    return "";
  }
}

export function Login() {
  const navigate = useNavigate();
  const { guardarSesion } = useAuth();
  const { iniciarSesion, loading, error, limpiarError } = useLogin();
  const [form, setForm] = useState({ email: "", password: "" });
  const [erroresCampo, setErroresCampo] = useState<{ email?: string; password?: string }>({});
  const [googlePendiente, setGooglePendiente] = useState<GooglePendiente | null>(null);
  // Sin valor por defecto: el rol debe elegirse de forma explícita.
  const [googleRol, setGoogleRol] = useState<RolGoogle | null>(null);
  const [googleCedula, setGoogleCedula] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const googlePanelRef = useRef<HTMLFormElement>(null);
  const googleLoadingRef = useRef(false);

  useEffect(() => {
    googleLoadingRef.current = googleLoading;
  }, [googleLoading]);

  const procesarResultadoGoogle = useCallback((resultado: ResultadoGoogle, rolSolicitado?: RolGoogle) => {
    if (resultado.tipo === "onboarding") {
      sessionStorage.setItem(GOOGLE_PENDIENTE_KEY, JSON.stringify({ idToken: resultado.idToken, email: resultado.email }));
      navigate("/google/completar-perfil", { state: { idToken: resultado.idToken, email: resultado.email } });
      return;
    }
    if (rolSolicitado && resultado.sesion.user.rol !== rolSolicitado) {
      setGoogleError(
        `Esa cuenta de Google ya está registrada como ${resultado.sesion.user.rol}. No es posible cambiar el rol desde aquí. Usa otra cuenta de Google o regístrate con correo como freelancer.`,
      );
      return;
    }
    try {
      // La cuenta ya tiene rol: no debe arrastrar la intención de un alta anterior.
      sessionStorage.removeItem(ROL_INTENT_KEY);
    } catch {
      // Sin sessionStorage la sesión sigue funcionando.
    }
    guardarSesion(resultado.sesion);
    navigate(dashboardPorRol(resultado.sesion.user.rol), { replace: true });
  }, [guardarSesion, navigate]);

  const continuarConGoogle = useCallback(async (
    credential: string,
    options?: { rolId?: 2 | 3; cedula?: string },
  ) => {
    if (googleLoading) return;
    setGoogleLoading(true);
    setGoogleError("");
    try {
      const resultado = await loginConGoogleUseCase.execute(credential, options);
      const rolSolicitado: RolGoogle | undefined =
        options?.rolId === 2 ? "freelancer" : options?.rolId === 3 ? "cliente" : undefined;
      procesarResultadoGoogle(resultado, rolSolicitado);
    } catch (e) {
      setGoogleError(e instanceof Error ? e.message : "No se pudo continuar con Google.");
    } finally {
      setGoogleLoading(false);
    }
  }, [googleLoading, procesarResultadoGoogle]);

  const handleGoogleCredential = useCallback((credential: string) => {
    const email = correoDesdeIdToken(credential);
    setGoogleRol(null);
    setGoogleCedula("");
    setGoogleError("");
    setGooglePendiente({ credential, email });
  }, []);

  const { contenedorRef, error: errorGoogle } = useGoogleLogin(handleGoogleCredential);

  useEffect(() => {
    if (!googlePendiente) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [googlePendiente]);

  useEffect(() => {
    if (!googlePendiente) return;
    const manejarTecla = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !googleLoadingRef.current) {
        setGooglePendiente(null);
        setGoogleError("");
        return;
      }
      if (event.key !== "Tab") return;

      const enfocables = Array.from(
        googlePanelRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (enfocables.length === 0) return;
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      const activo = document.activeElement;
      if (event.shiftKey && (activo === primero || activo === googlePanelRef.current)) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && activo === ultimo) {
        event.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener("keydown", manejarTecla);
    googlePanelRef.current?.focus();
    return () => document.removeEventListener("keydown", manejarTecla);
  }, [googlePendiente]);

  // Si el backend rechaza el login porque la cuenta no está verificada, se lleva
  // al usuario a la pantalla de verificación con su correo ya cargado.
  useEffect(() => {
    if (!error || !/confirma tu cuenta/i.test(error)) return;
    const email = form.email.trim();
    if (!email) return;
    sessionStorage.setItem("first_gig_email_pendiente", email);
    navigate("/verificar-cuenta", { state: { email, desdeLogin: true }, replace: true });
  }, [error, form.email, navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErroresCampo((current) => ({ ...current, [name]: undefined }));
    limpiarError();
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailInput = e.currentTarget.elements.namedItem("email");
    const nextErrors: { email?: string; password?: string } = {};
    if (!form.email.trim()) {
      nextErrors.email = "Ingresa tu correo electrónico.";
    } else if (emailInput instanceof HTMLInputElement && !emailInput.validity.valid) {
      nextErrors.email = "Ingresa un correo electrónico válido.";
    }
    if (!form.password) nextErrors.password = "Ingresa tu contraseña.";
    setErroresCampo(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const sesion = await iniciarSesion({ email: form.email.trim(), password: form.password });
    if (sesion) {
      guardarSesion(sesion);
      navigate(dashboardPorRol(sesion.user.rol), { replace: true });
    }
  };

  const handleGoogleRoleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!googlePendiente || googleLoading) return;
    if (!googleRol) {
      setGoogleError("Elige si usarás FirstGig como cliente o freelancer.");
      return;
    }
    if (googleRol === "freelancer" && !googleCedula.trim()) {
      setGoogleError("La cédula es obligatoria para freelancers.");
      return;
    }
    try {
      // Se conserva la elección por si el backend pide completar el perfil.
      sessionStorage.setItem(ROL_INTENT_KEY, googleRol);
    } catch {
      // Sin sessionStorage el flujo continúa igual.
    }
    void continuarConGoogle(googlePendiente.credential, {
      rolId: googleRol === "freelancer" ? 2 : 3,
      ...(googleCedula.trim() ? { cedula: googleCedula.trim() } : {}),
    });
  };

  const cancelarGoogle = () => {
    if (googleLoading) return;
    setGooglePendiente(null);
    setGoogleError("");
  };

  return (
    <div className="auth-page auth-screen auth-screen--login">
      <Brand appearance="auth" onClick={() => navigate("/")} />

      <form onSubmit={handleSubmit} className="login auth-card" noValidate>
        <h1>Iniciar sesión</h1>
        <p>Ingresa tus datos para continuar.</p>

        <div className="auth-field">
          <label htmlFor="login-email">Correo electrónico</label>
          <Input
            id="login-email"
            name="email"
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            className={erroresCampo.email ? "input--error" : ""}
            required
            aria-invalid={Boolean(erroresCampo.email)}
            aria-describedby={erroresCampo.email ? "login-email-error" : undefined}
          />
          {erroresCampo.email && <p className="error" id="login-email-error" role="alert">{erroresCampo.email}</p>}
        </div>
        <div className="auth-field">
          <label htmlFor="login-password">Contraseña</label>
          <Input
            id="login-password"
            name="password"
            type="password"
            placeholder="Contraseña"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            className={erroresCampo.password ? "input--error" : ""}
            required
            aria-invalid={Boolean(erroresCampo.password)}
            aria-describedby={erroresCampo.password ? "login-password-error" : undefined}
          />
          {erroresCampo.password && <p className="error" id="login-password-error" role="alert">{erroresCampo.password}</p>}
        </div>

        {error && <p className="error" role="alert">{error}</p>}

        <Button type="submit" className="btn-primary" disabled={loading} aria-busy={loading}>
          {loading ? <Spinner size="small" /> : "Ingresar"}
        </Button>

        <div className="divisor">
          <span>O CONTINÚA CON</span>
        </div>

        <div className="google-login-button" role="group" aria-label="Continuar con Google">
          <GoogleLogo size={24} />
          <div className="google-login-button__target" ref={contenedorRef} />
        </div>
        {errorGoogle && !errorGoogle.toLocaleLowerCase().includes("configur") && (
          <p className="error" role="alert">{errorGoogle}</p>
        )}
        {googleLoading && !googlePendiente && (
          <p className="google-login-status" role="status">Conectando con Google...</p>
        )}
        {googleError && !googlePendiente && (
          <p className="error" role="alert">{googleError}</p>
        )}

        <div className="links">
          <p>
            <Link to="/recuperar-password">¿Olvidaste tu contraseña?</Link>
          </p>
          <p>
            ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
          </p>
        </div>
      </form>

      {googlePendiente && (
        <div className="google-role-modal">
          <button
            className="google-role-modal__backdrop"
            type="button"
            aria-label="Cerrar selección de rol"
            onClick={cancelarGoogle}
          />
          <form
            ref={googlePanelRef}
            className="registro auth-card google-role-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="google-role-title"
            aria-describedby="google-role-description"
            tabIndex={-1}
            onSubmit={handleGoogleRoleSubmit}
            noValidate
          >
            <p className="google-role-modal__eyebrow">CUENTA DE GOOGLE</p>
            <h2 id="google-role-title">¿Cómo usarás FirstGig?</h2>
            <p id="google-role-description">
              {googlePendiente.email
                ? `Continuarás con ${googlePendiente.email}.`
                : "Elige el tipo de cuenta para terminar de crear tu cuenta."}
            </p>

            <fieldset className="roles account-selector" aria-describedby={!googleRol ? "google-role-required" : undefined}>
              <legend>Tipo de cuenta</legend>
              <Button
                type="button"
                variant={googleRol === "cliente" ? "primary" : "secondary"}
                className="account-selector__button"
                onClick={() => { setGoogleRol("cliente"); setGoogleError(""); }}
                aria-pressed={googleRol === "cliente"}
                disabled={googleLoading}
              >
                Soy cliente
              </Button>
              <Button
                type="button"
                variant={googleRol === "freelancer" ? "primary" : "secondary"}
                className="account-selector__button"
                onClick={() => { setGoogleRol("freelancer"); setGoogleError(""); }}
                aria-pressed={googleRol === "freelancer"}
                disabled={googleLoading}
              >
                Soy freelancer
              </Button>
            </fieldset>

            {!googleRol && (
              <p className="google-role-modal__hint" id="google-role-required" role="status">
                Elige una opción para continuar. El rol es obligatorio.
              </p>
            )}

            {googleRol === "freelancer" && (
              <div className="auth-field">
                <label htmlFor="google-cedula">Número de documento</label>
                <Input
                  id="google-cedula"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Cédula o documento"
                  value={googleCedula}
                  onChange={(event) => { setGoogleCedula(event.target.value); setGoogleError(""); }}
                  required
                  disabled={googleLoading}
                  aria-invalid={Boolean(googleError)}
                  aria-describedby={googleError ? "google-role-error" : undefined}
                />
                <small className="google-role-modal__hint">Es obligatorio para crear una cuenta freelancer.</small>
              </div>
            )}

            {googleError && <p className="error" id="google-role-error" role="alert">{googleError}</p>}

            <div className="google-role-modal__actions">
              <Button type="button" variant="secondary" onClick={cancelarGoogle} disabled={googleLoading}>
                Cancelar
              </Button>
              <Button type="submit" className="btn-primary" disabled={googleLoading} aria-busy={googleLoading}>
                {googleLoading ? <Spinner size="small" /> : "Continuar"}
              </Button>
            </div>

            <p className="google-role-modal__note">
              Si ya tienes una cuenta, conservaremos el rol que ya está registrado.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
