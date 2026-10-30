import { useCallback, useEffect, useState } from "react";

export type Tema = "light" | "dark";

const STORAGE_KEY = "first_gig_tema";

function leerTema(): Tema {
  try {
    return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

/**
 * Tema de las páginas internas. El login/registro no consumen las variables
 * `--fg-*`, así que este atributo no altera su apariencia.
 */
export function useTema() {
  const [tema, setTema] = useState<Tema>(leerTema);

  useEffect(() => {
    document.documentElement.dataset.fgTheme = tema;
    try {
      localStorage.setItem(STORAGE_KEY, tema);
    } catch {
      // El tema sigue funcionando en memoria aunque no se pueda persistir.
    }
  }, [tema]);

  const alternarTema = useCallback(() => {
    setTema((actual) => (actual === "dark" ? "light" : "dark"));
  }, []);

  return { tema, alternarTema };
}
