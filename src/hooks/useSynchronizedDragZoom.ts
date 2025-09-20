import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook para manejar la lógica de arrastre y zoom sincronizados de elementos.
 * @returns {object} Un objeto con el estado y los manejadores de eventos.
 */
export const useSynchronizedDragZoom = () => {
  const [globalScale, setGlobalScale] = useState<number>(1);
  const [globalPosition, setGlobalPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  /**
   * Maneja el evento de la rueda del ratón para el zoom.
   * @param e El evento de la rueda del ratón.
   */
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const newScale = Math.max(0.1, globalScale * (1 - e.deltaY * 0.001));
      setGlobalScale(newScale);
    },
    [globalScale]
  );

  /**
   * Maneja el evento de clic del ratón para iniciar el arrastre.
   * @param e El evento de clic del ratón.
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
      startPositionRef.current = {
        x: e.clientX - globalPosition.x,
        y: e.clientY - globalPosition.y,
      };
    },
    [globalPosition]
  );

  /**
   * Maneja el evento de movimiento del ratón para el arrastre.
   * @param e El evento de movimiento del ratón.
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        setGlobalPosition({
          x: e.clientX - startPositionRef.current.x,
          y: e.clientY - startPositionRef.current.y,
        });
      }
    },
    [isDragging]
  );

  /**
   * Maneja el evento de soltar el botón del ratón para detener el arrastre.
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Maneja el evento de doble clic para resetear el zoom y la posición.
   */
  const handleDoubleClick = useCallback(() => {
    setGlobalScale(1);
    setGlobalPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove, handleMouseUp, handleWheel]);

  return {
    globalScale,
    globalPosition,
    isDragging,
    handleWheel,
    handleMouseDown,
    handleDoubleClick,
  };
};
