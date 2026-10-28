import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useMiPerfil, useActualizarPerfil } from "../../features/perfil/hooks/usePerfil";
import type { DatosPerfilCliente } from "../../core/domain/entities/perfil";

export function PerfilCliente() {
  const { token } = useAuth();
  const { perfil, estado, error, recargar } = useMiPerfil(token);
  const { estado: estadoGuardar, ejecutar } = useActualizarPerfil(token);

  const [form, setForm] = useState<DatosPerfilCliente>({});

  useEffect(() => {
    if (estado.estado === "listo" && perfil) {
      setForm({
        nombre: perfil.nombre,
        telefono: perfil.telefono ?? "",
        fotoPerfil: perfil.fotoPerfil ?? "",
        descripcion: perfil.cliente?.descripcion ?? "",
        nombreEmpresa: perfil.cliente?.nombreEmpresa ?? "",
        tipoCliente: (perfil.cliente?.tipoCliente as "natural" | "empresa") ?? "natural",
      });
    }
  }, [estado, perfil]);

  const actualizarCampo = (campo: keyof DatosPerfilCliente, valor: string) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  };

  const guardar = async () => {
    const datos: DatosPerfilCliente = {};
    if (form.nombre !== undefined) datos.nombre = form.nombre;
    if (form.telefono !== undefined) datos.telefono = form.telefono;
    if (form.fotoPerfil !== undefined) datos.fotoPerfil = form.fotoPerfil;
    if (form.descripcion !== undefined) datos.descripcion = form.descripcion;
    if (form.nombreEmpresa !== undefined) datos.nombreEmpresa = form.nombreEmpresa;
    if (form.tipoCliente !== undefined) datos.tipoCliente = form.tipoCliente;

    const ok = await ejecutar(datos);
    if (ok) recargar();
  };

  if (estado.estado === "cargando") {
    return <section className="perfil-page"><p>Cargando tu perfil…</p></section>;
  }

  if (error || !perfil) {
    return (
      <section className="perfil-page">
        <p>No se pudo cargar tu perfil: {error ?? "desconocido"}</p>
        <button type="button" onClick={recargar}>Reintentar</button>
      </section>
    );
  }

  return (
    <section className="perfil-page">
      <h1>Mi perfil</h1>
      <p>Perfil actualizado correctamente.</p>
      <form className="perfil-form" onSubmit={(e) => { e.preventDefault(); void guardar(); }}>
        <label>
          Nombre
          <input value={form.nombre ?? ""} onChange={(e) => actualizarCampo("nombre", e.target.value)} />
        </label>
        <label>
          Teléfono
          <input value={form.telefono ?? ""} onChange={(e) => actualizarCampo("telefono", e.target.value)} />
        </label>
        <label>
          Foto (URL)
          <input value={form.fotoPerfil ?? ""} onChange={(e) => actualizarCampo("fotoPerfil", e.target.value)} />
        </label>
        <label>
          Descripción
          <input value={form.descripcion ?? ""} onChange={(e) => actualizarCampo("descripcion", e.target.value)} />
        </label>
        <label>
          Nombre empresa
          <input value={form.nombreEmpresa ?? ""} onChange={(e) => actualizarCampo("nombreEmpresa", e.target.value)} />
        </label>
        <label>
          Tipo cliente
          <select value={form.tipoCliente ?? "natural"} onChange={(e) => actualizarCampo("tipoCliente", e.target.value)}>
            <option value="natural">Natural</option>
            <option value="empresa">Empresa</option>
          </select>
        </label>
        <button type="submit" disabled={estadoGuardar.estado === "cargando"}>
          {estadoGuardar.estado === "cargando" ? "Guardando…" : "Guardar cambios"}
        </button>
        {estadoGuardar.estado === "exito" ? <p>{estadoGuardar.mensaje}</p> : null}
        {estadoGuardar.estado === "error" ? <p>{estadoGuardar.error}</p> : null}
      </form>
    </section>
  );
}
