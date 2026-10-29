import { useNavigate } from "react-router-dom";
import { ClientServicesOffersPage } from "../pages/services-offers";

export function ClientOffersRoute() {
  const navigate = useNavigate();
  return <ClientServicesOffersPage onContractPath={(path) => navigate(path)} />;
}
