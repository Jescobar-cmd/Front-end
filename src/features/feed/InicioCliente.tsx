import { FeedLayout } from "./FeedLayout";
import type { UsuarioFeed } from "./FeedLayout";
import "./feed.css";

export function InicioCliente({ usuario }: { usuario: UsuarioFeed }) {
  return <FeedLayout usuario={usuario} />;
}
