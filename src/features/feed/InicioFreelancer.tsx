import { FeedLayout } from "./FeedLayout";
import { useFeedData } from "./useFeedData";
import "./feed.css";

export function InicioFreelancer() {
  const datos = useFeedData("freelancer");
  return <FeedLayout datos={datos} />;
}
