import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import { crearReporte } from "../infrastructure/api/apiReportes";
import { errorMessage } from "../features/chat-contracts/chatContractsUtils";
import "./ReportDialog.css";

interface ReportDialogProps {
  open: boolean;
  /** Título del recurso reportado (usuario o proyecto). */
  targetLabel: string;
  usuarioReportadoId?: number;
  proyectoId?: number;
  onClose: () => void;
  onReported?: () => void;
}

const MOTIVOS = [
  "Spam o publicidad engañosa",
  "Contenido ofensivo o inapropiado",
  "Estafa o fraude",
  "Suplantación de identidad",
  "Incumplimiento de normas",
  "Otro motivo",
];

export function ReportDialog({
  open,
  targetLabel,
  usuarioReportadoId,
  proyectoId,
  onClose,
  onReported,
}: ReportDialogProps) {
  const { token } = useAuth();
  const [motivo, setMotivo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setMotivo("");
    setDescripcion("");
    setError("");
    setExito(false);
    const anterior = document.activeElement as HTMLElement | null;
    const manejarTecla = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", manejarTecla);
    panelRef.current?.querySelector<HTMLElement>("select, textarea")?.focus();
    return () => {
      document.removeEventListener("keydown", manejarTecla);
      anterior?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const enviar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || busy) return;
    if (!motivo) {
      setError("Selecciona un motivo.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await crearReporte(token, {
        ...(usuarioReportadoId ? { usuarioReportadoId } : {}),
        ...(proyectoId ? { proyectoId } : {}),
        motivo,
        ...(descripcion.trim() ? { descripcion: descripcion.trim() } : {}),
      });
      setExito(true);
      onReported?.();
    } catch (requestError) {
      setError(errorMessage(requestError, "No se pudo enviar el reporte."));
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="report-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="report-dialog" role="dialog" aria-modal="true" aria-labelledby="report-dialog-title" ref={panelRef}>
        <h2 id="report-dialog-title">Reportar {targetLabel}</h2>
        {exito ? (
          <>
            <p className="report-dialog__ok">Reporte enviado. Un moderador lo revisará pronto.</p>
            <button className="cc-primary-button" type="button" onClick={onClose}>Cerrar</button>
          </>
        ) : (
          <form onSubmit={enviar}>
            <p className="cc-muted">Tu reporte es confidencial y lo revisará el equipo de moderación de FirstGig.</p>
            <label className="cc-form__label">
              Motivo
              <select value={motivo} onChange={(event) => setMotivo(event.target.value)} required>
                <option value="">Selecciona un motivo…</option>
                {MOTIVOS.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
              </select>
            </label>
            <label className="cc-form__label">
              Detalles <span className="cc-muted">(opcional, máx. 1000)</span>
              <textarea rows={4} maxLength={1000} value={descripcion} onChange={(event) => setDescripcion(event.target.value)} placeholder="Describe qué pasó…" />
            </label>
            {error && <p className="cc-alert" role="alert">{error}</p>}
            <div className="cc-actions">
              <button className="cc-primary-button" type="submit" disabled={busy}>{busy ? "Enviando…" : "Enviar reporte"}</button>
              <button className="cc-secondary-button" type="button" disabled={busy} onClick={onClose}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
