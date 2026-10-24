import { FeedLayout } from "./FeedLayout";
import type { UsuarioFeed } from "./FeedLayout";
import { obtenerPiezasFeed } from "./datosFeed";
import "./feed.css";

export function InicioFreelancer({ usuario }: { usuario: UsuarioFeed }) {
  return (
    <FeedLayout
      usuario={usuario}
      piezas={obtenerPiezasFeed("freelancer")}
    />
  );
}
