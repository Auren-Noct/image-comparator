import { useImageActions, useImageData } from "../context/ImageDataContext";
import { useMemo } from "react";
import { useViewport, useViewportActions } from "../context/ViewportContext";
import { useComparisonResult } from "../context/ComparisonResultContext";
import { useViewOptions } from "../context/ViewOptionsContext";
import { useTheme } from "../context/ThemeContext";
import ImageDropZone from "./ImageDropZone";
import DraggableImage from "./DraggableImage";
import ComparisonStats from "./ComparisonStats";
import Spinner from "./Spinner";

/**
 * Componente principal que contiene la interfaz de usuario para la comparación de imágenes.
 * Toda la lógica de estado y gestión de datos se maneja a través del contexto.
 * @returns Un elemento JSX con la estructura de la aplicación.
 */
const ImageComparator = () => {
  const { image1, image2, isLoading1, isLoading2 } = useImageData();
  const { dropzoneProps1, dropzoneProps2 } = useImageActions();
  const {
    containerRef1,
    containerRef2,
    image1Zoom,
    image2Zoom,
    globalScale,
    globalPosition,
    isDragging,
  } = useViewport();
  const { handleDoubleClick, handleWheel, handleMouseDown } =
    useViewportActions();
  const {
    comparisonImageUrl,
    isProcessing,
    tempCanvasRef,
    comparisonCanvasRef,
  } = useComparisonResult();
  const { showBaseImage, showDetails } = useViewOptions();

  const showComparisonPanel = image1 && image2;
  const containerClass = showComparisonPanel ? "w-1/3" : "w-1/2";
  const { darkMode } = useTheme();

  const comparisonImageContent = useMemo(
    () => (
      <div className="relative w-full h-full">
        {showBaseImage && image1 && (
          <img
            src={image1.url}
            alt="Imagen de Fondo"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />
        )}
        {comparisonImageUrl && (
          <img
            src={comparisonImageUrl}
            alt="Imagen de Comparación"
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}
      </div>
    ),
    [showBaseImage, image1, comparisonImageUrl]
  );

  return (
    <div
      className="flex flex-col h-full md:flex-row gap-0 flex-grow"
      onDoubleClick={handleDoubleClick}
    >
      <canvas ref={tempCanvasRef} style={{ display: "none" }}></canvas>
      <canvas ref={comparisonCanvasRef} style={{ display: "none" }}></canvas>

      <div className="flex flex-row w-full gap-0 flex-grow">
        {/* Primer Drag and Drop */}
        <div
          ref={containerRef1}
          className={`${containerClass} h-full transition-all duration-500 rounded-lg shadow-lg flex flex-col justify-center items-center ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <ImageDropZone
            imageInfo={image1}
            dropzoneProps={dropzoneProps1}
            showDetails={showDetails}
            title="primera imagen"
            titleColorClass="text-blue-700"
            zoomPercentage={image1Zoom}
            isLoading={isLoading1}
          />
        </div>

        {/* Segundo Drag and Drop */}
        <div
          ref={containerRef2}
          className={`${containerClass} h-full transition-all duration-500 rounded-lg shadow-lg flex flex-col justify-center items-center ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <ImageDropZone
            imageInfo={image2}
            dropzoneProps={dropzoneProps2}
            showDetails={showDetails}
            title="segunda imagen"
            titleColorClass="text-green-700"
            zoomPercentage={image2Zoom}
            isLoading={isLoading2}
          />
        </div>

        {/* Imagen de Comparación */}
        {showComparisonPanel && (
          <div
            className={`${containerClass} h-full transition-all duration-500 rounded-lg shadow-lg flex flex-col justify-center items-center ${
              darkMode ? "bg-gray-800" : "bg-white"
            } relative`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <Spinner />
                <p
                  className={`text-center font-semibold ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Comparando imágenes...
                </p>
              </div>
            ) : (
              <>
                <div className="relative w-full h-full overflow-hidden">
                  <DraggableImage
                    scale={globalScale}
                    position={globalPosition}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    isDragging={isDragging}
                  >
                    {comparisonImageContent}
                  </DraggableImage>
                </div>
                <ComparisonStats />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageComparator;
