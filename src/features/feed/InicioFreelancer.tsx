import { FeedView } from "./FeedView";
import { useFeedData } from "./useFeedData";
import "./feed.css";

export function InicioFreelancer() {
  const datos = useFeedData("freelancer");
  return <FeedView datos={datos} />;
}
