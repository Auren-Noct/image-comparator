import { useImageComparator } from "../context/ImageComparatorContext";
import ImageDropZone from "./ImageDropZone";
import DraggableImage from "./DraggableImage";
import ImageSwapButton from "./ImageSwapButton";
import ComparisonStats from "./ComparisonStats";
import ImageOptions from "./ImageOptions";

/**
 * @description
 * Componente principal que contiene la UI para la comparación de imágenes.
 * Toda la lógica de estado se ha movido a un contexto.
 * @returns {JSX.Element}
 */
const ImageComparator = () => {
  const {
    image1Url,
    image2Url,
    showBaseImage,
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
    tempCanvasRef,
    comparisonCanvasRef,
    dropzoneProps1,
    dropzoneProps2,
    isSecondImageLoaded,
  } = useImageComparator();

  const containerClass = isSecondImageLoaded ? "w-1/3" : "w-1/2";

  return (
    <div
      className="flex flex-col h-full md:flex-row bg-gray-100 gap-0"
      onDoubleClick={handleDoubleClick}
    >
      <canvas ref={tempCanvasRef} style={{ display: "none" }}></canvas>
      <canvas ref={comparisonCanvasRef} style={{ display: "none" }}></canvas>

      {/* Primer Drag and Drop */}
      <div
        ref={containerRef1}
        className={`${containerClass} h-full transition-all duration-500 rounded-lg shadow-lg flex flex-col justify-center items-center bg-white`}
      >
        <ImageDropZone
          imageURL={image1Url}
          dropzoneProps={dropzoneProps1}
          title="primera imagen"
          titleColorClass="text-blue-500"
          globalScale={globalScale}
          globalPosition={globalPosition}
          isDragging={isDragging}
          handleWheel={handleWheel}
          handleMouseDown={handleMouseDown}
          zoomPercentage={image1Zoom}
        />
      </div>

      {/* Segundo Drag and Drop */}
      <div
        ref={containerRef2}
        className={`${containerClass} h-full transition-all duration-500 rounded-lg shadow-lg flex flex-col justify-center items-center bg-white`}
      >
        <ImageDropZone
          imageURL={image2Url}
          dropzoneProps={dropzoneProps2}
          title="segunda imagen"
          titleColorClass="text-green-500"
          globalScale={globalScale}
          globalPosition={globalPosition}
          isDragging={isDragging}
          handleWheel={handleWheel}
          handleMouseDown={handleMouseDown}
          zoomPercentage={image2Zoom}
        />
      </div>

      {/* Imagen de Comparación */}
      {isSecondImageLoaded && (
        <div
          className={`${containerClass} h-full transition-all duration-500 rounded-lg shadow-lg flex flex-col justify-center items-center bg-white relative`}
        >
          <DraggableImage
            scale={globalScale}
            position={globalPosition}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            isDragging={isDragging}
          >
            <div className="relative w-full h-full">
              {showBaseImage && image1Url && (
                <img
                  src={image1Url}
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
          </DraggableImage>

          {/* Nuevo componente para mostrar las estadísticas */}
          <ComparisonStats />

          {/* Nuevo componente para los checkboxes de opciones */}
          <ImageOptions />
        </div>
      )}

      {/* Nuevo componente para el botón de intercambio */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <ImageSwapButton />
      </div>
    </div>
  );
};

export default ImageComparator;
