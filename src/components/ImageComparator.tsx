import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import type { DropzoneState } from "react-dropzone";
import { useDropzone } from "react-dropzone";

/**
 * Propiedades para el componente DraggableImage.
 */
interface DraggableImageProps {
  children: React.ReactElement<{ style?: React.CSSProperties }>;
  scale: number;
  position: { x: number; y: number };
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  isDragging: boolean;
}

/**
 * Componente reutilizable para manejar la lógica de arrastrar y hacer zoom.
 */
const DraggableImage = ({
  children,
  scale,
  position,
  onWheel,
  onMouseDown,
  isDragging,
}: DraggableImageProps) => {
  const imageStyle: React.CSSProperties = {
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
    cursor: isDragging ? "grabbing" : "grab",
    transition: "transform 0s",
  };

  return (
    <div
      className="w-full h-full overflow-hidden flex justify-center items-center"
      onMouseDown={onMouseDown}
      onWheel={onWheel}
    >
      {children &&
        React.cloneElement(children, {
          style: { ...children.props.style, ...imageStyle },
        })}
    </div>
  );
};

/**
 * Propiedades para el componente ImageDropZone.
 */
interface ImageDropZoneProps {
  imageURL: string | null;
  dropzoneProps: DropzoneState;
  title: string;
  titleColorClass: string;
  globalScale: number;
  globalPosition: { x: number; y: number };
  isDragging: boolean;
  handleWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * Componente reutilizable para el área de drag-and-drop con imagen.
 */
const ImageDropZone = ({
  imageURL,
  dropzoneProps,
  title,
  titleColorClass,
  globalScale,
  globalPosition,
  isDragging,
  handleWheel,
  handleMouseDown,
}: ImageDropZoneProps) => {
  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center"
      {...dropzoneProps.getRootProps()}
    >
      <input {...dropzoneProps.getInputProps()} />
      {imageURL ? (
        <>
          <DraggableImage
            scale={globalScale}
            position={globalPosition}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            isDragging={isDragging}
          >
            <img
              src={imageURL}
              alt={title}
              className="h-full w-auto object-contain"
            />
          </DraggableImage>
          <div className="absolute top-4 left-4 bg-gray-800 text-white text-sm px-2 py-1 rounded-full opacity-75">
            Zoom: {(globalScale * 100).toFixed(0)}%
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-center font-bold select-none p-4">
          Arrastra y suelta aquí la{" "}
          <span className={titleColorClass}>{title}</span>
        </p>
      )}
    </div>
  );
};

/**
 * Hook personalizado para manejar la lógica de arrastre y zoom sincronizados.
 */
const useSynchronizedDragZoom = () => {
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
  }, [handleMouseMove, handleMouseUp]);

  return {
    globalScale,
    globalPosition,
    isDragging,
    handleWheel,
    handleMouseDown,
    handleDoubleClick,
  };
};

/**
 * Hook personalizado para manejar la lógica de procesamiento de imágenes.
 */
const useImageProcessing = (
  image1Url: string | null,
  image2Url: string | null,
  showSimilarities: boolean,
  showDifferences: boolean,
  showBaseImage: boolean
) => {
  const [comparisonImageUrl, setComparisonImageUrl] = useState<string | null>(
    null
  );
  const [similarityPercentage, setSimilarityPercentage] = useState<
    number | null
  >(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const comparisonCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (image1Url && image2Url) {
      const firstImage = new Image();
      const secondImage = new Image();

      firstImage.crossOrigin = "anonymous";
      secondImage.crossOrigin = "anonymous";

      firstImage.onload = () => {
        secondImage.onload = () => {
          const width = Math.max(firstImage.width, secondImage.width);
          const height = Math.max(firstImage.height, secondImage.height);

          const tempCanvas = tempCanvasRef.current;
          const comparisonCanvas = comparisonCanvasRef.current;
          if (!tempCanvas || !comparisonCanvas) return;

          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCanvasContext = tempCanvas.getContext("2d");
          if (!tempCanvasContext) return;

          // Dibuja la primera imagen en el canvas temporal
          tempCanvasContext.clearRect(0, 0, width, height);
          tempCanvasContext.drawImage(firstImage, 0, 0);
          const firstImageData = tempCanvasContext.getImageData(
            0,
            0,
            width,
            height
          ).data;

          // Dibuja la segunda imagen en el canvas temporal
          tempCanvasContext.clearRect(0, 0, width, height);
          tempCanvasContext.drawImage(secondImage, 0, 0);
          const secondImageData = tempCanvasContext.getImageData(
            0,
            0,
            width,
            height
          ).data;

          comparisonCanvas.width = width;
          comparisonCanvas.height = height;
          const comparisonCanvasContext = comparisonCanvas.getContext("2d");
          if (!comparisonCanvasContext) return;
          const comparisonData = comparisonCanvasContext.createImageData(
            width,
            height
          );

          let matchCount = 0;
          const totalPixels = width * height;

          const similarityColor = [0, 255, 0]; // Verde
          const differenceColor = [255, 0, 0]; // Rojo
          const overlayAlpha = showBaseImage ? 128 : 255;

          for (let i = 0; i < firstImageData.length; i += 4) {
            const firstImageRed = firstImageData[i];
            const firstImageGreen = firstImageData[i + 1];
            const firstImageBlue = firstImageData[i + 2];
            const firstImageAlpha = firstImageData[i + 3];

            const secondImageRed = secondImageData[i];
            const secondImageGreen = secondImageData[i + 1];
            const secondImageBlue = secondImageData[i + 2];
            const secondImageAlpha = secondImageData[i + 3];

            const isMatch =
              firstImageRed === secondImageRed &&
              firstImageGreen === secondImageGreen &&
              firstImageBlue === secondImageBlue &&
              firstImageAlpha === secondImageAlpha;

            if (isMatch) {
              matchCount++;
              if (showSimilarities) {
                comparisonData.data[i] = similarityColor[0];
                comparisonData.data[i + 1] = similarityColor[1];
                comparisonData.data[i + 2] = similarityColor[2];
                comparisonData.data[i + 3] = overlayAlpha;
              } else {
                comparisonData.data[i + 3] = 0;
              }
            } else {
              if (showDifferences) {
                comparisonData.data[i] = differenceColor[0];
                comparisonData.data[i + 1] = differenceColor[1];
                comparisonData.data[i + 2] = differenceColor[2];
                comparisonData.data[i + 3] = overlayAlpha;
              } else {
                comparisonData.data[i + 3] = 0;
              }
            }
          }

          comparisonCanvasContext.putImageData(comparisonData, 0, 0);

          setSimilarityPercentage((matchCount / totalPixels) * 100);
          setComparisonImageUrl(comparisonCanvas.toDataURL());
        };
        secondImage.src = image2Url;
      };
      firstImage.src = image1Url;
    }
  }, [image1Url, image2Url, showSimilarities, showDifferences, showBaseImage]);

  return {
    comparisonImageUrl,
    similarityPercentage,
    tempCanvasRef,
    comparisonCanvasRef,
  };
};

const ImageComparator = () => {
  const [image1Url, setImage1Url] = useState<string | null>(null);
  const [image2Url, setImage2Url] = useState<string | null>(null);
  const [showBaseImage, setShowBaseImage] = useState<boolean>(true);
  const [showSimilarities, setShowSimilarities] = useState<boolean>(true);
  const [showDifferences, setShowDifferences] = useState<boolean>(true);

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

  const onDrop1 = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => setImage1Url(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const onDrop2 = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => setImage2Url(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

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
  }, [image1Url, image2Url]);

  const isSecondImageLoaded = image2Url !== null;
  const containerClass = useMemo(
    () => (isSecondImageLoaded ? "w-1/3" : "w-1/2"),
    [isSecondImageLoaded]
  );

  const differencePercentage = useMemo(() => {
    return similarityPercentage !== null ? 100 - similarityPercentage : null;
  }, [similarityPercentage]);

  return (
    <div
      className="flex flex-col h-screen md:flex-row bg-gray-100 mt-2 gap-0"
      onDoubleClick={handleDoubleClick}
    >
      <canvas ref={tempCanvasRef} style={{ display: "none" }}></canvas>
      <canvas ref={comparisonCanvasRef} style={{ display: "none" }}></canvas>

      {/* Primer Drag and Drop */}
      <div
        className={`${containerClass} h-[95vh] transition-all duration-500 rounded-lg shadow-lg flex flex-col justify-center items-center bg-white`}
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
        />
      </div>

      {/* Segundo Drag and Drop */}
      <div
        className={`${containerClass} h-[95vh] transition-all duration-500 rounded-lg shadow-lg flex flex-col justify-center items-center bg-white`}
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
        />
      </div>

      {/* Imagen de Comparación */}
      {isSecondImageLoaded && (
        <div
          className={`${containerClass} h-[95vh] transition-all duration-500 rounded-lg shadow-lg flex flex-col justify-center items-center bg-white relative`}
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

          <div className="absolute top-4 left-4 bg-gray-800 text-white text-sm px-2 py-1 rounded-full opacity-75 flex flex-col items-end">
            <span>
              Similitud:{" "}
              {similarityPercentage !== null
                ? similarityPercentage.toFixed(2)
                : "N/A"}
              %
            </span>
            <span>
              Diferencia:{" "}
              {differencePercentage !== null
                ? differencePercentage.toFixed(2)
                : "N/A"}
              %
            </span>
          </div>

          <div className="absolute top-4 right-4 flex flex-col gap-2 p-2 bg-white bg-opacity-75 rounded-lg shadow-md">
            <label className="inline-flex items-center text-sm font-medium text-gray-800">
              <input
                type="checkbox"
                checked={showBaseImage}
                onChange={(e) => setShowBaseImage(e.target.checked)}
                className="form-checkbox text-blue-600 rounded"
              />
              <span className="ml-2">Mostrar Fondo</span>
            </label>
            <label className="inline-flex items-center text-sm font-medium text-gray-800">
              <input
                type="checkbox"
                checked={showSimilarities}
                onChange={(e) => setShowSimilarities(e.target.checked)}
                className="form-checkbox text-blue-600 rounded"
              />
              <span className="ml-2">Mostrar Similitudes</span>
            </label>
            <label className="inline-flex items-center text-sm font-medium text-gray-800">
              <input
                type="checkbox"
                checked={showDifferences}
                onChange={(e) => setShowDifferences(e.target.checked)}
                className="form-checkbox text-blue-600 rounded"
              />
              <span className="ml-2">Mostrar Diferencias</span>
            </label>
          </div>
        </div>
      )}

      {/* Botón para intercambiar imágenes */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        {image1Url && image2Url && (
          <button
            onClick={handleSwapImages}
            className="px-6 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-300"
          >
            Intercambiar Imágenes
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageComparator;
