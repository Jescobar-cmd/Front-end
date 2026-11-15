import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge";
import { Button, buttonClassName } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { useAuth } from "../../../context/AuthContext";
import { moderacionApi } from "../../../infrastructure/api/apiModeracion";
import type {
  PublicacionModerada,
  TipoPublicacion,
} from "../../../infrastructure/api/apiModeracion";
import { Avatar } from "../components/Avatar";
import { DataTable } from "../components/DataTable";
import type { ColumnaTabla } from "../components/DataTable";
import { EstadoBadge } from "../components/EstadoBadge";
import { ListToolbar } from "../components/ListToolbar";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import {
  esApiError,
  formatearFecha,
  formatearMoneda,
  mensajeError,
  truncar,
} from "../utils";

const LIMITE = 20;

const TIPOS: Array<{ value: TipoPublicacion; label: string }> = [
  { value: "servicio", label: "Servicios" },
  { value: "proyecto", label: "Proyectos" },
];

const ESTADOS: Record<TipoPublicacion, Array<{ value: string; label: string }>> = {
  servicio: [
    { value: "", label: "Todos los estados" },
    { value: "activo", label: "Activos" },
    { value: "pausado", label: "Pausados" },
    { value: "eliminado", label: "Retirados" },
  ],
  proyecto: [
    { value: "", label: "Todos los estados" },
    { value: "abierto", label: "Abiertos" },
    { value: "en_progreso", label: "En progreso" },
    { value: "completado", label: "Completados" },
    { value: "cancelado", label: "Retirados o cancelados" },
  ],
};

export function PublicacionesPage() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const tipo: TipoPublicacion =
    searchParams.get("tipo") === "proyecto" ? "proyecto" : "servicio";
  const estado = searchParams.get("estado") ?? "";
  const texto = searchParams.get("texto") ?? "";
  const pageParam = Number(searchParams.get("page"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const [busqueda, setBusqueda] = useState(texto);
  const [publicaciones, setPublicaciones] = useState<PublicacionModerada[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [moduloPendiente, setModuloPendiente] = useState(false);
  const [recarga, setRecarga] = useState(0);

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
      .listarPublicaciones(token, {
        tipo,
        estado,
        texto,
        page,
        limit: LIMITE,
      })
      .then((resultado) => {
        if (!activo) return;
        setPublicaciones(resultado.items ?? []);
        setTotal(resultado.total ?? 0);
      })
      .catch((reason: unknown) => {
        if (!activo) return;
        if (esApiError(reason) && reason.status === 404) {
          setPublicaciones([]);
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
  }, [token, tipo, estado, texto, page, recarga]);

  const cambiarTipo = (nuevo: TipoPublicacion) => {
    const params = new URLSearchParams(searchParams);
    params.set("tipo", nuevo);
    params.delete("estado");
    params.delete("page");
    setSearchParams(params, { replace: true });
  };

  const cambiarEstado = (nuevo: string) => {
    const params = new URLSearchParams(searchParams);
    if (nuevo) params.set("estado", nuevo);
    else params.delete("estado");
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

  const columnas: Array<ColumnaTabla<PublicacionModerada>> = [
    {
      key: "publicacion",
      header: "Publicación",
      render: (publicacion) => (
        <span className="mod-pub-cell">
          <strong title={publicacion.titulo}>{truncar(publicacion.titulo, 62)}</strong>
          <small>
            {publicacion.categoria ?? "Sin categoría"} ·{" "}
            {formatearFecha(publicacion.fechaPublicacion)}
          </small>
        </span>
      ),
    },
    {
      key: "autor",
      header: "Autor",
      render: (publicacion) => (
        <span className="mod-user-cell">
          <Avatar
            nombre={publicacion.autor.nombre}
            fotoPerfil={publicacion.autor.fotoPerfil}
            size="sm"
          />
          <span>
            <strong>{publicacion.autor.nombre}</strong>
            <small>#{publicacion.autor.id}</small>
          </span>
        </span>
      ),
    },
    {
      key: "precio",
      header: tipo === "servicio" ? "Precio" : "Presupuesto",
      width: "140px",
      render: (publicacion) => (
        <span className="mod-amount mod-amount--strong">
          {formatearMoneda(publicacion.precio)}
        </span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      width: "150px",
      render: (publicacion) => (
        <span className="mod-row-actions">
          <EstadoBadge estado={publicacion.estado} />
          {publicacion.moderacion.retirada ? (
            <Badge tone="danger">Retirada</Badge>
          ) : null}
        </span>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      width: "130px",
      align: "right",
      render: (publicacion) => (
        <Link
          className={buttonClassName({ variant: "secondary", size: "sm" })}
          to={`/moderacion/publicaciones/${publicacion.tipo}/${publicacion.id}`}
        >
          Ver detalle
        </Link>
      ),
    },
  ];

  const etiquetaTipo = tipo === "servicio" ? "servicios" : "proyectos";

  return (
    <div className="mod-page">
      <PageHeader
        eyebrow="Moderación · Publicaciones"
        title="Publicaciones del marketplace"
        description="Revisa los servicios de freelancers y los proyectos de clientes, incluidos los retirados, y gestiona su visibilidad."
      />

      <div className="mod-tabs" role="tablist" aria-label="Tipo de publicación">
        {TIPOS.map((opcion) => (
          <button
            key={opcion.value}
            type="button"
            role="tab"
            aria-selected={tipo === opcion.value}
            className={`mod-tab${tipo === opcion.value ? " is-active" : ""}`}
            onClick={() => cambiarTipo(opcion.value)}
          >
            {opcion.label}
          </button>
        ))}
      </div>

      <ListToolbar
        summary={
          cargando
            ? `Cargando ${etiquetaTipo}…`
            : `${total} ${total === 1 ? "publicación" : "publicaciones"}${
                estado || texto ? " con los filtros aplicados" : ""
              }`
        }
        onRefresh={() => setRecarga((valor) => valor + 1)}
        refreshing={cargando}
      >
        <form className="mod-user-search" onSubmit={buscar} role="search">
          <Input
            label="Buscar publicación"
            type="search"
            value={busqueda}
            placeholder="Título, descripción o autor"
            onChange={(event) => setBusqueda(event.target.value)}
          />
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </form>
        <Select
          label="Estado de la publicación"
          options={ESTADOS[tipo]}
          value={estado}
          onChange={(event) => cambiarEstado(event.target.value)}
        />
      </ListToolbar>

      {moduloPendiente ? (
        <section className="mod-panel" role="status" aria-live="polite">
          <div className="mod-panel__head">
            <div>
              <h2>Módulo pendiente de habilitar</h2>
              <p>
                El backend todavía no expone el listado de publicaciones para
                moderación. La pantalla quedará operativa cuando se desplieguen
                los endpoints <code>/api/moderador/publicaciones</code>.
              </p>
            </div>
          </div>
          <div className="mod-alert mod-alert--warning">
            <span>
              Mientras tanto puedes seguir gestionando reportes, disputas,
              liquidaciones y perfiles desde el resto del panel.
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setRecarga((valor) => valor + 1)}
            >
              Reintentar
            </Button>
          </div>
        </section>
      ) : (
        <>
          <DataTable
            caption={`Listado de ${etiquetaTipo} para moderación`}
            columns={columnas}
            rows={publicaciones}
            rowKey={(publicacion) => `${publicacion.tipo}-${publicacion.id}`}
            loading={cargando}
            error={error}
            onRetry={() => setRecarga((valor) => valor + 1)}
            emptyTitle={
              estado || texto
                ? `No hay ${etiquetaTipo} con esos filtros`
                : `No hay ${etiquetaTipo} registrados`
            }
            emptyDescription={
              estado || texto
                ? "Prueba con otro estado o limpia los filtros para ver todas las publicaciones."
                : `Cuando exista un ${tipo} publicado aparecerá aquí, incluso si fue retirado.`
            }
            emptyActionLabel={estado || texto ? "Limpiar filtros" : "Actualizar"}
            onEmptyAction={
              estado || texto
                ? () => {
                    const params = new URLSearchParams(searchParams);
                    params.delete("estado");
                    params.delete("texto");
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
