import { Badge } from "../../../components/ui/Badge";
import type { BadgeTone } from "../../../components/ui/Badge";
import { etiquetaEstado } from "../utils";

const TONOS: Record<string, BadgeTone> = {
  activo: "green",
  pagada: "green",
  resuelto: "green",
  resuelta: "green",
  completado: "green",
  liberado: "green",
  pendiente: "warning",
  abierta: "warning",
  solicitada: "warning",
  en_revision: "blue",
  retenido: "blue",
  pendiente_pago: "warning",
  suspendido: "danger",
  rechazado: "danger",
  rechazada: "danger",
  cancelado: "danger",
  reembolsado: "danger",
  inactivo: "neutral",
};

export function EstadoBadge({ estado }: { estado: string | null | undefined }) {
  if (!estado) return <Badge>Sin estado</Badge>;
  return <Badge tone={TONOS[estado] ?? "neutral"}>{etiquetaEstado(estado)}</Badge>;
}
