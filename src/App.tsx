import { AppRoutes } from "./routes/AppRoutes";
import { SessionExpiredBanner } from "./components/SessionExpiredBanner";

export default function App() {
  return (
    <>
      <SessionExpiredBanner />
      <AppRoutes />
    </>
  );
}
