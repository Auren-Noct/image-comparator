import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook personalizado para manejar la lógica de arrastre y zoom sincronizados.
 */
export const useSynchronizedDragZoom = () => {
  const [globalScale, setGlobalScale] = useState<number>(1);
  const [globalPosition, setGlobalPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const newScale = Math.max(0.1, globalScale * (1 - e.deltaY * 0.001));
      setGlobalScale(newScale);
    },
    [globalScale]
  );

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

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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
