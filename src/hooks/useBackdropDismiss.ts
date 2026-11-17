import { useEffect, useRef } from "react";
import type { RefObject } from "react";

/**
 * Cierra un diálogo al hacer clic fuera de él (sobre el backdrop).
 * Se usa listener imperativo para que el backdrop siga siendo un
 * elemento puramente visual (sin handlers interactivos en JSX).
 */
export function useBackdropDismiss(
  backdropRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  busy: boolean,
  onDismiss: () => void,
): void {
  const busyRef = useRef(busy);
  const dismissRef = useRef(onDismiss);
  busyRef.current = busy;
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (!enabled) return;
    const backdrop = backdropRef.current;
    if (!backdrop) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (event.target === backdrop && !busyRef.current) {
        dismissRef.current();
      }
    };

    backdrop.addEventListener("mousedown", handleMouseDown);
    return () => backdrop.removeEventListener("mousedown", handleMouseDown);
  }, [enabled, backdropRef]);
}
