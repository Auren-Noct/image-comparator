import { useEffect, type RefObject } from "react";

type Event = MouseEvent | TouchEvent;

/**
 * Hook personalizado para detectar clics fuera de un elemento referenciado.
 * @param ref La referencia al elemento del DOM.
 * @param handler La función a ejecutar cuando se hace clic fuera.
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: Event) => void
) => {
  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref.current;
      // No hacer nada si el clic es dentro del elemento referenciado o sus descendientes
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]); // Volver a vincular si el handler o la ref cambian
};
