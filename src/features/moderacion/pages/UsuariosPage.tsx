import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, buttonClassName } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { useAuth } from "../../../context/AuthContext";
import { moderacionApi } from "../../../infrastructure/api/apiModeracion";
import type {
  EstadoCuenta,
  PerfilPublicoModeracion,
  UsuarioModeracionResumen,
} from "../../../infrastructure/api/apiModeracion";
import { AccountModerationCard } from "../components/AccountModerationCard";
import { Avatar } from "../components/Avatar";
import { DataTable } from "../components/DataTable";
import type { ColumnaTabla } from "../components/DataTable";
import { EstadoBadge } from "../components/EstadoBadge";
import { ListToolbar } from "../components/ListToolbar";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import {
  esApiError,
  etiquetaRolDesdeNombre,
  formatearFecha,
  formatearFechaHora,
  mensajeError,
  truncar,
} from "../utils";

const LIMITE = 20;

const ROLES = [
  { value: "", label: "Todos los roles" },
  { value: "2", label: "Freelancers" },
  { value: "3", label: "Clientes" },
  { value: "4", label: "Moderadores" },
  { value: "1", label: "Administradores" },
];

const ESTADOS = [
  { value: "", label: "Todos los estados" },
  { value: "activo", label: "Activos" },
  { value: "inactivo", label: "Inactivos" },
  { value: "suspendido", label: "Suspendidos" },
];

export function UsuariosPage() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const texto = searchParams.get("texto") ?? "";
  const rolParam = searchParams.get("rol") ?? "";
  const rolValido = ROLES.some((opcion) => opcion.value === rolParam);
  const rol = rolValido ? rolParam : "";
  const estadoParam = searchParams.get("estado") ?? "";
  const estadoValido = ESTADOS.some((opcion) => opcion.value === estadoParam);
  const estado = (estadoValido ? estadoParam : "") as EstadoCuenta | "";
  const pageParam = Number(searchParams.get("page"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const [busqueda, setBusqueda] = useState(texto);
  const [usuarios, setUsuarios] = useState<UsuarioModeracionResumen[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [moduloPendiente, setModuloPendiente] = useState(false);
  const [recarga, setRecarga] = useState(0);

  const [idFallback, setIdFallback] = useState("");
  const [perfilFallback, setPerfilFallback] = useState<PerfilPublicoModeracion | null>(null);
  const [buscandoFallback, setBuscandoFallback] = useState(false);
  const [errorFallback, setErrorFallback] = useState("");

  useEffect(() => {
    setBusqueda(texto);
  }, [texto]);

  useEffect(() => {
    if (!token) return;
    let activo = true;
    setCargando(true);
    setError("");
    setModuloPendiente(false);

    moderacionApi
      .listarUsuarios(token, {
        texto,
        rol: rol ? Number(rol) : "",
        estado,
        page,
        limit: LIMITE,
      })
      .then((resultado) => {
        if (!activo) return;
        setUsuarios(resultado.items ?? []);
        setTotal(resultado.total ?? 0);
      })
      .catch((reason: unknown) => {
        if (!activo) return;
        if (esApiError(reason) && reason.status === 404) {
          setUsuarios([]);
          setTotal(0);
          setModuloPendiente(true);
          return;
        }
        setError(mensajeError(reason));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [token, texto, rol, estado, page, recarga]);

  const actualizarFiltro = (clave: "rol" | "estado", valor: string) => {
    const params = new URLSearchParams(searchParams);
    if (valor) params.set(clave, valor);
    else params.delete(clave);
    params.delete("page");
    setSearchParams(params, { replace: true });
  };

  const buscar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    const limpio = busqueda.trim();
    if (limpio) params.set("texto", limpio);
    else params.delete("texto");
    params.delete("page");
    setSearchParams(params, { replace: true });
  };

  const cambiarPagina = (nuevaPagina: number) => {
    const params = new URLSearchParams(searchParams);
    if (nuevaPagina > 1) params.set("page", String(nuevaPagina));
    else params.delete("page");
    setSearchParams(params);
  };

  const buscarPorId = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    const id = Number(idFallback);
    if (!Number.isInteger(id) || id <= 0) {
      setErrorFallback("Ingresa un ID de usuario válido (número entero mayor que cero).");
      setPerfilFallback(null);
      return;
    }
    setBuscandoFallback(true);
    setErrorFallback("");
    try {
      setPerfilFallback(await moderacionApi.obtenerPerfilPublico(token, id));
    } catch (reason) {
      setPerfilFallback(null);
      setErrorFallback(
        esApiError(reason) && reason.status === 404
          ? "No existe un usuario con ese ID."
          : mensajeError(reason),
      );
    } finally {
      setBuscandoFallback(false);
    }
  };

  const columnas: Array<ColumnaTabla<UsuarioModeracionResumen>> = [
    {
      key: "usuario",
      header: "Usuario",
      render: (usuario) => (
        <span className="mod-user-cell">
          <Avatar nombre={usuario.nombre} fotoPerfil={usuario.fotoPerfil} size="sm" />
          <span>
            <strong>{usuario.nombre}</strong>
            <small>{usuario.email}</small>
          </span>
        </span>
      ),
    },
    {
      key: "rol",
      header: "Rol",
      width: "130px",
      render: (usuario) => (
        <span>{etiquetaRolDesdeNombre(usuario.rol, usuario.rolId)}</span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      width: "130px",
      render: (usuario) => <EstadoBadge estado={usuario.estado} />,
    },
    {
      key: "registro",
      header: "Registro",
      width: "140px",
      render: (usuario) => (
        <span className="mod-nowrap">{formatearFecha(usuario.fechaRegistro)}</span>
      ),
    },
    {
      key: "suspension",
      header: "Suspensión",
      render: (usuario) =>
        usuario.suspension?.motivo ? (
          <span className="mod-date-stack">
            <span title={usuario.suspension.motivo}>
              {truncar(usuario.suspension.motivo, 48)}
            </span>
            <small>{formatearFecha(usuario.suspension.fecha)}</small>
          </span>
        ) : (
          <span className="mod-muted">Sin suspensión activa</span>
        ),
    },
    {
      key: "acciones",
      header: "Acciones",
      width: "120px",
      align: "right",
      render: (usuario) => (
        <Link
          className={buttonClassName({ variant: "secondary", size: "sm" })}
          to={`/moderacion/usuarios/${usuario.id}`}
        >
          Ver ficha
        </Link>
      ),
    },
  ];

  return (
    <div className="mod-page">
      <PageHeader
        eyebrow="Moderación · Usuarios"
        title="Perfiles de la comunidad"
        description="Busca cuentas por nombre o correo, revisa su estado y aplica suspensiones con motivo registrado."
      />

      <ListToolbar
        summary={
          cargando
            ? "Cargando usuarios…"
            : `${total} ${total === 1 ? "usuario" : "usuarios"}${
                texto || rol || estado ? " con los filtros aplicados" : ""
              }`
        }
        onRefresh={() => setRecarga((valor) => valor + 1)}
        refreshing={cargando}
      >
        <form className="mod-user-search" onSubmit={buscar} role="search">
          <Input
            label="Buscar usuario"
            type="search"
            value={busqueda}
            placeholder="Nombre o correo electrónico"
            onChange={(event) => setBusqueda(event.target.value)}
          />
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </form>
        <Select
          label="Rol"
          options={ROLES}
          value={rol}
          onChange={(event) => actualizarFiltro("rol", event.target.value)}
        />
        <Select
          label="Estado de la cuenta"
          options={ESTADOS}
          value={estado}
          onChange={(event) => actualizarFiltro("estado", event.target.value)}
        />
      </ListToolbar>

      {moduloPendiente ? (
        <section className="mod-panel" role="status" aria-live="polite">
          <div className="mod-panel__head">
            <div>
              <h2>Módulo pendiente de habilitar</h2>
              <p>
                El backend todavía no expone el listado global de usuarios. La pantalla
                quedará operativa cuando se desplieguen los endpoints{" "}
                <code>/api/moderador/usuarios</code>.
              </p>
            </div>
          </div>
          <div className="mod-alert mod-alert--warning">
            <span>
              Mientras tanto puedes moderar cuentas desde el detalle de un reporte o una
              disputa, o buscar una cuenta por ID aquí abajo.
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setRecarga((valor) => valor + 1)}
            >
              Reintentar
            </Button>
          </div>

          <form className="mod-user-search" onSubmit={(event) => void buscarPorId(event)} role="search">
            <Input
              label="Buscar por ID"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={idFallback}
              placeholder="Ej. 51"
              onChange={(event) => {
                setIdFallback(event.target.value);
                if (errorFallback) setErrorFallback("");
              }}
            />
            <Button type="submit" variant="primary" disabled={buscandoFallback}>
              {buscandoFallback ? "Buscando…" : "Buscar usuario"}
            </Button>
          </form>

          {errorFallback ? (
            <div className="mod-alert mod-alert--error" role="alert">
              <span>{errorFallback}</span>
            </div>
          ) : null}

          {perfilFallback ? (
            <div className="mod-stack">
              <div className="mod-user-profile">
                <Avatar
                  nombre={perfilFallback.nombre}
                  fotoPerfil={perfilFallback.fotoPerfil}
                  size="lg"
                />
                <div className="mod-user-profile__data">
                  <strong>{perfilFallback.nombre}</strong>
                  <span>
                    {etiquetaRolDesdeNombre(perfilFallback.rolNombre, perfilFallback.rolId)} ·
                    Registro: {formatearFechaHora(perfilFallback.fechaRegistro)}
                  </span>
                </div>
              </div>
              <AccountModerationCard
                usuario={{
                  id: perfilFallback.id,
                  nombre: perfilFallback.nombre,
                  fotoPerfil: perfilFallback.fotoPerfil,
                  rolId: perfilFallback.rolId,
                  estado: perfilFallback.estado,
                }}
              />
            </div>
          ) : null}
        </section>
      ) : (
        <>
          <DataTable
            caption="Listado de usuarios de la plataforma"
            columns={columnas}
            rows={usuarios}
            rowKey={(usuario) => usuario.id}
            loading={cargando}
            error={error}
            onRetry={() => setRecarga((valor) => valor + 1)}
            emptyTitle={
              texto || rol || estado ? "No hay usuarios con esos filtros" : "No hay usuarios registrados"
            }
            emptyDescription={
              texto || rol || estado
                ? "Prueba con otro término o limpia los filtros para ver todas las cuentas."
                : "Cuando se registre una cuenta aparecerá en este listado."
            }
            emptyActionLabel={texto || rol || estado ? "Limpiar filtros" : "Actualizar"}
            onEmptyAction={
              texto || rol || estado
                ? () => {
                    const params = new URLSearchParams(searchParams);
                    params.delete("texto");
                    params.delete("rol");
                    params.delete("estado");
                    params.delete("page");
                    setSearchParams(params, { replace: true });
                  }
                : () => setRecarga((valor) => valor + 1)
            }
          />

          <Pagination page={page} total={total} limit={LIMITE} onChange={cambiarPagina} />
        </>
      )}
    </div>
  );
}
