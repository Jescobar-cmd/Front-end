import { FeedView } from "./FeedView";
import { useFeedData } from "./useFeedData";
import "./feed.css";

export function InicioCliente() {
  const datos = useFeedData("cliente");
  return <FeedView datos={datos} />;
}
