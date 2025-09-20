import { useEffect, useRef } from "react";

/**
 * Hook para observar cambios en el tamaño de un elemento del DOM.
 * @param ref La referencia al elemento del DOM que se va a observar.
 * @param onResize La función de callback que se ejecuta cuando el tamaño del elemento cambia.
 */
export const useResizeObserver = (
  ref: React.RefObject<HTMLElement | null>,
  onResize: (size: { width: number; height: number }) => void
) => {
  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (!entries || !entries.length) return;
      const { contentRect } = entries[0];
      onResizeRef.current({
        width: contentRect.width,
        height: contentRect.height,
      });
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref]);
};
