import { FeedLayout } from "./FeedLayout";
import { useFeedData } from "./useFeedData";
import "./feed.css";

export function InicioFreelancer({ vistaPrevia = false }: { vistaPrevia?: boolean }) {
  const datos = useFeedData("freelancer", vistaPrevia);
  return <FeedLayout datos={datos} />;
}
