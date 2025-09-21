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

  const { image1Dimensions, image2Dimensions } = useImageData();

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
    setImage1Zoom(calculateZoom(image1Dimensions, containerDimensions));
    setImage2Zoom(calculateZoom(image2Dimensions, containerDimensions));
  }, [
    globalScale,
    image1Dimensions,
    image2Dimensions,
    containerDimensions,
    calculateZoom,
  ]);

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
