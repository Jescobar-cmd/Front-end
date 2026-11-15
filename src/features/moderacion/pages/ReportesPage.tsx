import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { buttonClassName } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { useAuth } from "../../../context/AuthContext";
import { moderacionApi } from "../../../infrastructure/api/apiModeracion";
import type { EstadoReporte, Reporte } from "../../../infrastructure/api/apiModeracion";
import { DataTable } from "../components/DataTable";
import type { ColumnaTabla } from "../components/DataTable";
import { EstadoBadge } from "../components/EstadoBadge";
import { ListToolbar } from "../components/ListToolbar";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { Avatar } from "../components/Avatar";
import { usePerfilesUsuarios } from "../hooks/usePerfilesUsuarios";
import { formatearFechaHora, mensajeError, truncar } from "../utils";

const LIMITE = 20;

type EstadoFiltro = EstadoReporte | "";

const OPCIONES_ESTADO = [
  { value: "", label: "Todos los estados" },
  { value: "pendiente", label: "Pendientes" },
  { value: "resuelto", label: "Resueltos" },
  { value: "rechazado", label: "Rechazados" },
];

function UsuarioCelda({
  id,
  nombre,
  fotoPerfil,
}: {
  id: number | null;
  nombre?: string;
  fotoPerfil?: string | null;
}) {
  if (!id) return <span className="mod-muted">Sin usuario</span>;
  const etiqueta = nombre ?? `Usuario #${id}`;
  return (
    <span className="mod-user-cell">
      <Avatar nombre={etiqueta} fotoPerfil={fotoPerfil} size="sm" />
      <span>
        <strong>{etiqueta}</strong>
        <small>#{id}</small>
      </span>
    </span>
  );
}

export function ReportesPage() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  const estadoParam = searchParams.get("estado") ?? "";
  const estadoValido = OPCIONES_ESTADO.some((opcion) => opcion.value === estadoParam);
  const estado = (estadoValido ? estadoParam : "") as EstadoFiltro;
  const pageParam = Number(searchParams.get("page"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  useEffect(() => {
    if (!token) return;
    let activo = true;
    setCargando(true);
    setError("");
    moderacionApi
      .listarReportes(token, { estado, page, limit: LIMITE })
      .then((resultado) => {
        if (!activo) return;
        setReportes(resultado.reportes ?? []);
        setTotal(resultado.total ?? 0);
      })
      .catch((reason: unknown) => {
        if (!activo) return;
        setError(mensajeError(reason));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [token, estado, page, recarga]);

  const idsUsuarios = useMemo(
    () =>
      reportes.flatMap((reporte) =>
        [reporte.usuarioReportaId, reporte.usuarioReportadoId].filter(
          (id): id is number => typeof id === "number",
        ),
      ),
    [reportes],
  );
  const perfiles = usePerfilesUsuarios(token, idsUsuarios);

  const cambiarEstado = (nuevo: string) => {
    const params = new URLSearchParams(searchParams);
    if (nuevo) params.set("estado", nuevo);
    else params.delete("estado");
    params.delete("page");
    setSearchParams(params, { replace: true });
  };

  const cambiarPagina = (nuevaPagina: number) => {
    const params = new URLSearchParams(searchParams);
    if (nuevaPagina > 1) params.set("page", String(nuevaPagina));
    else params.delete("page");
    setSearchParams(params);
  };

  const columnas: Array<ColumnaTabla<Reporte>> = [
    {
      key: "fecha",
      header: "Fecha",
      width: "150px",
      render: (reporte) => <span className="mod-nowrap">{formatearFechaHora(reporte.fecha)}</span>,
    },
    {
      key: "reportante",
      header: "Reportante",
      render: (reporte) => {
        const perfil = perfiles[reporte.usuarioReportaId];
        return (
          <UsuarioCelda
            id={reporte.usuarioReportaId}
            nombre={perfil?.nombre}
            fotoPerfil={perfil?.fotoPerfil}
          />
        );
      },
    },
    {
      key: "reportado",
      header: "Reportado",
      render: (reporte) => {
        const perfil = reporte.usuarioReportadoId
          ? perfiles[reporte.usuarioReportadoId]
          : undefined;
        return (
          <UsuarioCelda
            id={reporte.usuarioReportadoId}
            nombre={perfil?.nombre}
            fotoPerfil={perfil?.fotoPerfil}
          />
        );
      },
    },
    {
      key: "motivo",
      header: "Motivo",
      render: (reporte) => <span title={reporte.motivo}>{truncar(reporte.motivo, 58)}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      width: "120px",
      render: (reporte) => <EstadoBadge estado={reporte.estado} />,
    },
    {
      key: "acciones",
      header: "Acciones",
      width: "130px",
      align: "right",
      render: (reporte) => (
        <Link
          className={buttonClassName({ variant: "secondary", size: "sm" })}
          to={`/moderacion/reportes/${reporte.id}`}
        >
          Ver detalle
        </Link>
      ),
    },
  ];

  return (
    <div className="mod-page">
      <PageHeader
        eyebrow="Moderación · Reportes"
        title="Reportes de la comunidad"
        description="Revisa los reportes recibidos, consulta el contexto de las partes y deja una resolución registrada."
      />

      <ListToolbar
        summary={
          cargando
            ? "Cargando reportes…"
            : `${total} ${total === 1 ? "reporte" : "reportes"}${estado ? " con el filtro aplicado" : ""}`
        }
        onRefresh={() => setRecarga((valor) => valor + 1)}
        refreshing={cargando}
      >
        <Select
          label="Estado del reporte"
          options={OPCIONES_ESTADO}
          value={estado}
          onChange={(event) => cambiarEstado(event.target.value)}
        />
      </ListToolbar>

      <DataTable
        caption="Listado de reportes de la comunidad"
        columns={columnas}
        rows={reportes}
        rowKey={(reporte) => reporte.id}
        loading={cargando}
        error={error}
        onRetry={() => setRecarga((valor) => valor + 1)}
        emptyTitle={estado ? "No hay reportes con ese estado" : "No hay reportes registrados"}
        emptyDescription={
          estado
            ? "Prueba con otro estado o limpia el filtro para ver todos los reportes."
            : "Cuando la comunidad envíe un reporte aparecerá aquí."
        }
        emptyActionLabel={estado ? "Limpiar filtro" : "Actualizar"}
        onEmptyAction={
          estado ? () => cambiarEstado("") : () => setRecarga((valor) => valor + 1)
        }
      />

      <Pagination page={page} total={total} limit={LIMITE} onChange={cambiarPagina} />
    </div>
  );
}
