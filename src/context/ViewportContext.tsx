import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSynchronizedDragZoom } from "../hooks/useSynchronizedDragZoom";
import { useResizeObserver } from "../hooks/useResizeObserver";
import { useImageData } from "./ImageDataContext";

/**
 * Define el estado del viewport (zoom, posición, etc.).
 */
interface ViewportState {
  containerRef1: React.RefObject<HTMLDivElement | null>;
  containerRef2: React.RefObject<HTMLDivElement | null>;
  image1Zoom: number | null;
  image2Zoom: number | null;
  globalScale: number;
  globalPosition: { x: number; y: number };
  isDragging: boolean;
}

/**
 * Define las acciones que se pueden realizar sobre el viewport.
 */
interface ViewportActions {
  handleWheel: (event: React.WheelEvent<HTMLDivElement>) => void;
  handleMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleDoubleClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const ViewportContext = createContext<ViewportState | undefined>(undefined);
const ViewportActionsContext = createContext<ViewportActions | undefined>(
  undefined
);

/**
 * Hook para consumir el estado del viewport.
 * @returns {ViewportState} El estado actual del viewport.
 * @throws {Error} Si se usa fuera de un `ViewportProvider`.
 */
export const useViewport = () => {
  const context = useContext(ViewportContext);
  if (!context) {
    throw new Error("useViewport debe ser usado dentro de un ViewportProvider");
  }
  return context;
};

/**
 * Hook para consumir las acciones disponibles para el viewport.
 * @returns {ViewportActions} Un objeto con las funciones para manipular el viewport.
 * @throws {Error} Si se usa fuera de un `ViewportProvider`.
 */
export const useViewportActions = () => {
  const context = useContext(ViewportActionsContext);
  if (!context) {
    throw new Error(
      "useViewportActions debe ser usado dentro de un ViewportProvider"
    );
  }
  return context;
};

/**
 * Proveedor que gestiona el estado y las acciones relacionadas con el viewport (zoom y arrastre).
 * @param {object} props - Las props del componente.
 * @param {ReactNode} props.children - Los componentes hijos que tendrán acceso al contexto.
 */
export const ViewportProvider = ({ children }: { children: ReactNode }) => {
  const containerRef1 = useRef<HTMLDivElement>(null);
  const containerRef2 = useRef<HTMLDivElement>(null);
  const [image1Zoom, setImage1Zoom] = useState<number | null>(null);
  const [image2Zoom, setImage2Zoom] = useState<number | null>(null);
  const [containerDimensions, setContainerDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const { image1, image2 } = useImageData();

  const {
    globalScale,
    globalPosition,
    isDragging,
    handleWheel,
    handleMouseDown,
    handleDoubleClick,
  } = useSynchronizedDragZoom();

  useResizeObserver(containerRef1, setContainerDimensions);

  const calculateZoom = useCallback(
    (
      imgDims: { width: number; height: number } | null,
      containerDims: { width: number; height: number } | null
    ) => {
      if (imgDims && containerDims && imgDims.width > 0 && imgDims.height > 0) {
        const { width: clientWidth, height: clientHeight } = containerDims;
        const { width: imgWidth, height: imgHeight } = imgDims;
        const initialScale = Math.min(
          clientWidth / imgWidth,
          clientHeight / imgHeight
        );
        return globalScale * initialScale * 100;
      }
      return null;
    },
    [globalScale]
  );

  useEffect(() => {
    const image1Dimensions = image1
      ? { width: image1.width, height: image1.height }
      : null;
    const image2Dimensions = image2
      ? { width: image2.width, height: image2.height }
      : null;

    setImage1Zoom(calculateZoom(image1Dimensions, containerDimensions));
    setImage2Zoom(calculateZoom(image2Dimensions, containerDimensions));
  }, [globalScale, image1, image2, containerDimensions, calculateZoom]);

  const prevImage1Ref = useRef(image1);
  const prevImage2Ref = useRef(image2);

  // Reinicia el zoom y la posición cuando se carga una nueva imagen.
  useEffect(() => {
    const prevImage1 = prevImage1Ref.current;
    const prevImage2 = prevImage2Ref.current;

    // Detecta si las imágenes solo se intercambiaron
    const isSwap = image1 === prevImage2 && image2 === prevImage1;

    // Si no es un intercambio (es una carga nueva o un reseteo), reinicia el zoom.
    if (!isSwap) {
      handleDoubleClick();
    }

    // Actualiza las referencias para la próxima renderización.
    prevImage1Ref.current = image1;
    prevImage2Ref.current = image2;
  }, [image1, image2, handleDoubleClick]);

  const stateValue = useMemo(
    () => ({
      containerRef1,
      containerRef2,
      image1Zoom,
      image2Zoom,
      globalScale,
      globalPosition,
      isDragging,
    }),
    [
      containerRef1,
      containerRef2,
      image1Zoom,
      image2Zoom,
      globalScale,
      globalPosition,
      isDragging,
    ]
  );

  const actionsValue = useMemo(
    () => ({ handleWheel, handleMouseDown, handleDoubleClick }),
    [handleWheel, handleMouseDown, handleDoubleClick]
  );

  return (
    <ViewportContext.Provider value={stateValue}>
      <ViewportActionsContext.Provider value={actionsValue}>
        {children}
      </ViewportActionsContext.Provider>
    </ViewportContext.Provider>
  );
};
