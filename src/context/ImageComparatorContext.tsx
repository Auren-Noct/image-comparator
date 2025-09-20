import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useDropzone, type DropzoneState } from "react-dropzone";
import { useSynchronizedDragZoom } from "../hooks/useSynchronizedDragZoom";
import { useImageProcessing } from "../hooks/useImageProcessing";
import { useResizeObserver } from "../hooks/useResizeObserver";

/**
 * Define el tipo para el contexto de la herramienta de comparación de imágenes.
 * @interface ImageComparatorContextType
 */
interface ImageComparatorContextType {
  image1Url: string | null;
  setImage1Url: (url: string | null) => void;
  image2Url: string | null;
  setImage2Url: (url: string | null) => void;
  image1Dimensions: { width: number; height: number } | null;
  setImage1Dimensions: (dims: { width: number; height: number } | null) => void;
  image2Dimensions: { width: number; height: number } | null;
  setImage2Dimensions: (dims: { width: number; height: number } | null) => void;
  showBaseImage: boolean;
  setShowBaseImage: (value: boolean) => void;
  showSimilarities: boolean;
  setShowSimilarities: (value: boolean) => void;
  showDifferences: boolean;
  setShowDifferences: (value: boolean) => void;
  containerRef1: React.RefObject<HTMLDivElement | null>;
  containerRef2: React.RefObject<HTMLDivElement | null>;
  image1Zoom: number | null;
  image2Zoom: number | null;
  globalScale: number;
  globalPosition: { x: number; y: number };
  isDragging: boolean;
  handleWheel: (event: React.WheelEvent<HTMLDivElement>) => void;
  handleMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleDoubleClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  comparisonImageUrl: string | null;
  similarityPercentage: number | null;
  tempCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  comparisonCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  dropzoneProps1: DropzoneState;
  dropzoneProps2: DropzoneState;
  handleSwapImages: () => void;
  differencePercentage: number | null;
  isSecondImageLoaded: boolean;
}

// 1. Crear el contexto con un valor por defecto
const ImageComparatorContext = createContext<
  ImageComparatorContextType | undefined
>(undefined);

/**
 * Hook para consumir el contexto de comparación de imágenes.
 *
 * @returns {ImageComparatorContextType} El objeto de contexto con toda la lógica y el estado.
 * @throws {Error} Si se usa fuera de un `ImageComparatorProvider`.
 * @example
 * ```
 * const { image1Url, similarityPercentage } = useImageComparator();
 * ```
 */
export const useImageComparator = () => {
  const context = useContext(ImageComparatorContext);
  if (context === undefined) {
    throw new Error(
      "useImageComparator debe ser usado dentro de un ImageComparatorProvider"
    );
  }
  return context;
};

/**
 * Componente proveedor que gestiona el estado global y la lógica de la herramienta
 * de comparación de imágenes.
 * @param {object} props - Las props del componente.
 * @param {ReactNode} props.children - Los componentes hijos que tendrán acceso al contexto.
 */
const ImageComparatorProvider = ({ children }: { children: ReactNode }) => {
  const [image1Url, setImage1Url] = useState<string | null>(null);
  const [image2Url, setImage2Url] = useState<string | null>(null);
  const [image1Dimensions, setImage1Dimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [image2Dimensions, setImage2Dimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [showBaseImage, setShowBaseImage] = useState<boolean>(true);
  const [showSimilarities, setShowSimilarities] = useState<boolean>(true);
  const [showDifferences, setShowDifferences] = useState<boolean>(true);
  const containerRef1 = useRef<HTMLDivElement>(null);
  const containerRef2 = useRef<HTMLDivElement>(null);
  const [image1Zoom, setImage1Zoom] = useState<number | null>(null);
  const [image2Zoom, setImage2Zoom] = useState<number | null>(null);
  const [containerDimensions, setContainerDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const {
    globalScale,
    globalPosition,
    isDragging,
    handleWheel,
    handleMouseDown,
    handleDoubleClick,
  } = useSynchronizedDragZoom();

  const {
    comparisonImageUrl,
    similarityPercentage,
    tempCanvasRef,
    comparisonCanvasRef,
  } = useImageProcessing(
    image1Url,
    image2Url,
    showSimilarities,
    showDifferences,
    showBaseImage
  );

  useResizeObserver(containerRef1, setContainerDimensions);
  useResizeObserver(containerRef2, setContainerDimensions);

  /**
   * Calcula el porcentaje de zoom de una imagen en relación con el tamaño de su contenedor.
   * @param imgDims Las dimensiones de la imagen.
   * @param containerDims Las dimensiones del contenedor.
   * @returns El porcentaje de zoom o `null` si no hay datos.
   */
  const calculateZoom = useCallback(
    (
      imgDims: { width: number; height: number } | null,
      containerDims: { width: number; height: number } | null
    ) => {
      if (imgDims && containerDims) {
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

  /**
   * Sincroniza el cálculo del zoom cada vez que cambian las dimensiones de las imágenes o del contenedor.
   */
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

  /**
   * Función genérica para manejar la carga de imágenes a través de Dropzone.
   * @param setterUrl - La función de estado para la URL de la imagen.
   * @param setterDims - La función de estado para las dimensiones de la imagen.
   * @returns Un callback para el evento `onDrop` de Dropzone.
   */
  const handleImageDrop = useCallback(
    (
        setterUrl: (url: string | null) => void,
        setterDims: (dims: { width: number; height: number } | null) => void
      ) =>
      (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const dims = { width: img.width, height: img.height };
            setterDims(dims);
            setterUrl(reader.result as string);
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      },
    []
  );

  const dropzoneProps1 = useDropzone({
    onDrop: handleImageDrop(setImage1Url, setImage1Dimensions),
    noClick: true,
    accept: { "image/*": [] },
  });
  const dropzoneProps2 = useDropzone({
    onDrop: handleImageDrop(setImage2Url, setImage2Dimensions),
    noClick: true,
    accept: { "image/*": [] },
  });

  /**
   * Intercambia las URLs y dimensiones de las imágenes 1 y 2.
   */
  const handleSwapImages = useCallback(() => {
    setImage1Url(image2Url);
    setImage2Url(image1Url);
    setImage1Dimensions(image2Dimensions);
    setImage2Dimensions(image1Dimensions);
  }, [image1Url, image2Url, image1Dimensions, image2Dimensions]);

  const isSecondImageLoaded = image2Url !== null;
  const differencePercentage = useMemo(() => {
    return similarityPercentage !== null ? 100 - similarityPercentage : null;
  }, [similarityPercentage]);

  const value = {
    image1Url,
    setImage1Url,
    image2Url,
    setImage2Url,
    image1Dimensions,
    setImage1Dimensions,
    image2Dimensions,
    setImage2Dimensions,
    showBaseImage,
    setShowBaseImage,
    showSimilarities,
    setShowSimilarities,
    showDifferences,
    setShowDifferences,
    containerRef1,
    containerRef2,
    image1Zoom,
    image2Zoom,
    globalScale,
    globalPosition,
    isDragging,
    handleWheel,
    handleMouseDown,
    handleDoubleClick,
    comparisonImageUrl,
    similarityPercentage,
    tempCanvasRef,
    comparisonCanvasRef,
    dropzoneProps1,
    dropzoneProps2,
    handleSwapImages,
    differencePercentage,
    isSecondImageLoaded,
  };

  return (
    <ImageComparatorContext.Provider value={value}>
      {children}
    </ImageComparatorContext.Provider>
  );
};

export default ImageComparatorProvider;
