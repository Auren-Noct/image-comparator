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

// Tipado para el contexto
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

// 2. Crear un hook personalizado para consumir el contexto
export const useImageComparator = () => {
  const context = useContext(ImageComparatorContext);
  if (context === undefined) {
    throw new Error(
      "useImageComparator debe ser usado dentro de un ImageComparatorProvider"
    );
  }
  return context;
};

// 3. Crear el componente proveedor que contendrá toda la lógica de estado
const ImageComparatorProvider = ({ children }: { children: ReactNode }) => {
  // Toda la lógica y el estado de tu componente original se mueven aquí
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

  const calculateZoom = useCallback(
    (
      imgDims: { width: number; height: number } | null,
      containerRef: React.RefObject<HTMLDivElement | null>
    ) => {
      if (imgDims && containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
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
    setImage1Zoom(calculateZoom(image1Dimensions, containerRef1));
    setImage2Zoom(calculateZoom(image2Dimensions, containerRef2));
  }, [globalScale, image1Dimensions, image2Dimensions, calculateZoom]);

  const onDrop1 = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const dims = { width: img.width, height: img.height };
          setImage1Dimensions(dims);
          setImage1Url(reader.result as string);
          setImage1Zoom(calculateZoom(dims, containerRef1));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    },
    [calculateZoom]
  );

  const onDrop2 = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const dims = { width: img.width, height: img.height };
          setImage2Dimensions(dims);
          setImage2Url(reader.result as string);
          setImage2Zoom(calculateZoom(dims, containerRef2));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    },
    [calculateZoom]
  );

  const dropzoneProps1 = useDropzone({
    onDrop: onDrop1,
    noClick: true,
    accept: { "image/*": [] },
  });
  const dropzoneProps2 = useDropzone({
    onDrop: onDrop2,
    noClick: true,
    accept: { "image/*": [] },
  });

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

  // 4. Se define el objeto de valor que se pasará a los componentes
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
