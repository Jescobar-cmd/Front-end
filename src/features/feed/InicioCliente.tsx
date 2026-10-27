import { FeedLayout } from "./FeedLayout";
import { useFeedData } from "./useFeedData";
import "./feed.css";

export function InicioCliente() {
  const datos = useFeedData("cliente");
  return <FeedLayout datos={datos} />;
}
