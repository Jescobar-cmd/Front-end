import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { buttonClassName } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { useAuth } from "../../../context/AuthContext";
import { moderacionApi } from "../../../infrastructure/api/apiModeracion";
import type { Disputa, EstadoDisputa } from "../../../infrastructure/api/apiModeracion";
import { DataTable } from "../components/DataTable";
import type { ColumnaTabla } from "../components/DataTable";
import { EstadoBadge } from "../components/EstadoBadge";
import { ListToolbar } from "../components/ListToolbar";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { formatearFechaHora, mensajeError, truncar } from "../utils";

const LIMITE = 20;

const OPCIONES_ESTADO = [
  { value: "abierta", label: "Abiertas" },
  { value: "en_revision", label: "En revisión" },
  { value: "resuelta", label: "Resueltas" },
  { value: "rechazada", label: "Rechazadas" },
  { value: "todas", label: "Todas las disputas" },
];

type EstadoFiltro = EstadoDisputa | "";

export function DisputasPage() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [disputas, setDisputas] = useState<Disputa[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  const estadoUrl = searchParams.get("estado") ?? "abierta";
  const estadoValido = OPCIONES_ESTADO.some((opcion) => opcion.value === estadoUrl);
  const estadoSeleccionado = estadoValido ? estadoUrl : "abierta";
  const estado: EstadoFiltro = estadoSeleccionado === "todas" ? "" : (estadoSeleccionado as EstadoFiltro);
  const pageParam = Number(searchParams.get("page"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  useEffect(() => {
    if (!token) return;
    let activo = true;
    setCargando(true);
    setError("");
    moderacionApi
      .listarDisputas(token, { estado, page, limit: LIMITE })
      .then((resultado) => {
        if (!activo) return;
        setDisputas(resultado.disputas ?? []);
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

  const columnas: Array<ColumnaTabla<Disputa>> = [
    {
      key: "id",
      header: "ID",
      width: "70px",
      render: (disputa) => <span className="mod-id">#{disputa.id}</span>,
    },
    {
      key: "contrato",
      header: "Contrato",
      width: "110px",
      render: (disputa) => <span className="mod-id">#{disputa.contratoId}</span>,
    },
    {
      key: "motivo",
      header: "Motivo",
      render: (disputa) => <span title={disputa.motivo}>{truncar(disputa.motivo, 62)}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      width: "130px",
      render: (disputa) => <EstadoBadge estado={disputa.estado} />,
    },
    {
      key: "fecha",
      header: "Apertura",
      width: "160px",
      render: (disputa) => (
        <span className="mod-nowrap">{formatearFechaHora(disputa.fechaApertura)}</span>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      width: "130px",
      align: "right",
      render: (disputa) => (
        <Link
          className={buttonClassName({ variant: "secondary", size: "sm" })}
          to={`/moderacion/disputas/${disputa.id}`}
        >
          Revisar
        </Link>
      ),
    },
  ];

  return (
    <div className="mod-page">
      <PageHeader
        eyebrow="Moderación · Disputas"
        title="Disputas entre partes"
        description="Revisa el contrato y el conflicto. Cada resolución debe indicar el resultado económico cuando corresponda."
      />

      <ListToolbar
        summary={
          cargando
            ? "Cargando disputas…"
            : `${total} ${total === 1 ? "disputa" : "disputas"}${estado ? "" : " en total"}`
        }
        onRefresh={() => setRecarga((valor) => valor + 1)}
        refreshing={cargando}
      >
        <Select
          label="Estado de la disputa"
          options={OPCIONES_ESTADO}
          value={estadoSeleccionado}
          onChange={(event) => cambiarEstado(event.target.value)}
        />
      </ListToolbar>

      <DataTable
        caption="Listado de disputas entre clientes y freelancers"
        columns={columnas}
        rows={disputas}
        rowKey={(disputa) => disputa.id}
        loading={cargando}
        error={error}
        onRetry={() => setRecarga((valor) => valor + 1)}
        emptyTitle="No hay disputas con ese estado"
        emptyDescription="Cambia el filtro para consultar otros estados o vuelve más tarde."
        emptyActionLabel={estado ? "Ver todas" : "Actualizar"}
        onEmptyAction={
          estado ? () => cambiarEstado("todas") : () => setRecarga((valor) => valor + 1)
        }
      />

      <Pagination page={page} total={total} limit={LIMITE} onChange={cambiarPagina} />
    </div>
  );
}
