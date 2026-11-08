import { createContext, useContext, useState } from "react";

interface InternalSearchValue {
  query: string;
  setQuery: (value: string) => void;
}

export const InternalSearchContext = createContext<InternalSearchValue | null>(null);

export function useInternalSearch() {
  const contexto = useContext(InternalSearchContext);
  const [queryLocal, setQueryLocal] = useState("");
  return contexto ?? { query: queryLocal, setQuery: setQueryLocal };
}
