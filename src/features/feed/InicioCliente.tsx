import { FeedLayout } from "./FeedLayout";
import { useFeedData } from "./useFeedData";
import "./feed.css";

export function InicioCliente({ vistaPrevia = false }: { vistaPrevia?: boolean }) {
  const datos = useFeedData("cliente", vistaPrevia);
  return <FeedLayout datos={datos} />;
}
