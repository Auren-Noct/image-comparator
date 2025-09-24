import { type ReactNode } from "react";
import { useImageProcessing } from "../hooks/useImageProcessing";
import { ImageDataProvider, useImageData } from "./ImageDataContext";
import { ViewOptionsProvider, useViewOptions } from "./ViewOptionsContext";
import { ViewportProvider } from "./ViewportContext";
import { ComparisonResultProvider } from "./ComparisonResultContext";

/**
 * Componente que orquesta y provee los contextos especializados para la comparación de imágenes.
 * Cada proveedor gestiona una parte específica del estado, mejorando el rendimiento y la separación de concerns.
 */
const ImageComparatorOrchestrator = ({ children }: { children: ReactNode }) => {
  const { image1, image2 } = useImageData();
  const { showSimilarities, showDifferences, showBaseImage } = useViewOptions();

  const {
    comparisonImageUrl,
    similarityPercentage,
    isProcessing,
    tempCanvasRef,
    comparisonCanvasRef,
  } = useImageProcessing(
    image1?.url ?? null,
    image2?.url ?? null,
    showSimilarities,
    showDifferences,
    showBaseImage
  );

  return (
    <ComparisonResultProvider
      value={{
        comparisonImageUrl,
        similarityPercentage,
        isProcessing,
        tempCanvasRef,
        comparisonCanvasRef,
      }}
    >
      {children}
    </ComparisonResultProvider>
  );
};

/**
 * Proveedor principal que envuelve la aplicación con todos los contextos necesarios.
 * @param {object} props - Las props del componente.
 * @param {ReactNode} props.children - Los componentes hijos que tendrán acceso al contexto.
 */
const ImageComparatorProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ImageDataProvider>
      <ViewOptionsProvider>
        <ViewportProvider>
          <ImageComparatorOrchestrator>{children}</ImageComparatorOrchestrator>
        </ViewportProvider>
      </ViewOptionsProvider>
    </ImageDataProvider>
  );
};

export default ImageComparatorProvider;
