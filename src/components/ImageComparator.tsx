import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useDropzone } from "react-dropzone";

// Definiciones de tipos para las propiedades del componente DraggableImage
interface DraggableImageProps {
  children: React.ReactElement;
  scale: number;
  position: { x: number; y: number };
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  isDragging: boolean;
}

// Componente personalizado para manejar arrastrar y hacer zoom en una imagen
const DraggableImage: React.FC<DraggableImageProps> = ({
  children,
  scale,
  position,
  onWheel,
  onMouseDown,
  isDragging,
}) => {
  const imageStyle: React.CSSProperties = {
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
    cursor: isDragging ? "grabbing" : "grab",
    transition: "transform 0s", // Deshabilitar la transición al arrastrar
  };

  return (
    <div
      className="w-full h-full overflow-hidden flex justify-center items-center"
      onMouseDown={onMouseDown}
      onWheel={onWheel}
    >
      {children &&
        React.cloneElement(children as React.ReactElement<any>, {
          style: { ...(children.props as any).style, ...imageStyle },
        })}
    </div>
  );
};

const ImageComparator: React.FC = () => {
  const [image1Url, setImage1Url] = useState<string | null>(null);
  const [image2Url, setImage2Url] = useState<string | null>(null);
  const [comparisonImageUrl, setComparisonImageUrl] = useState<string | null>(
    null
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Estado sincronizado para el zoom y la posición
  const [globalScale, setGlobalScale] = useState<number>(1);
  const [globalPosition, setGlobalPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const comparisonCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [similarityPercentage, setSimilarityPercentage] = useState<
    number | null
  >(null);

  // Lógica de arrastrar y soltar solo por arrastre (sin clic)
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

  const { getRootProps: getRootProps1, getInputProps: getInputProps1 } =
    useDropzone({ onDrop: onDrop1, noClick: true, accept: { "image/*": [] } });
  const { getRootProps: getRootProps2, getInputProps: getInputProps2 } =
    useDropzone({ onDrop: onDrop2, noClick: true, accept: { "image/*": [] } });

  // Lógica de sincronización de arrastre y zoom
  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const newScale = Math.max(0.1, globalScale * (1 - e.deltaY * 0.001));
      setGlobalScale(newScale);
    },
    [globalScale]
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault(); // Evita el comportamiento predeterminado del navegador
      setIsDragging(true);
      startPos.current = {
        x: e.clientX - globalPosition.x,
        y: e.clientY - globalPosition.y,
      };
    },
    [globalPosition]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        setGlobalPosition({
          x: e.clientX - startPos.current.x,
          y: e.clientY - startPos.current.y,
        });
      }
    },
    [isDragging]
  );

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [onMouseMove, onMouseUp]);

  // Reiniciar zoom y posición cuando se carga una nueva imagen
  useEffect(() => {
    if (image1Url || image2Url) {
      setGlobalScale(1);
      setGlobalPosition({ x: 0, y: 0 });
      setComparisonImageUrl(null);
      setSimilarityPercentage(null);
    }
  }, [image1Url, image2Url]);

  const isSecondImageLoaded = image2Url !== null;
  const containerClass = useMemo(
    () => (isSecondImageLoaded ? "w-1/3" : "w-1/2"),
    [isSecondImageLoaded]
  );

  useEffect(() => {
    if (image1Url && image2Url) {
      const img1 = new Image();
      const img2 = new Image();

      img1.crossOrigin = "anonymous";
      img2.crossOrigin = "anonymous";

      img1.onload = () => {
        img2.onload = () => {
          const width = Math.max(img1.width, img2.width);
          const height = Math.max(img1.height, img2.height);

          const canvas = canvasRef.current;
          if (!canvas) return;
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          // Dibuja la primera imagen en el canvas temporal
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img1, 0, 0);
          const imageData1 = ctx.getImageData(0, 0, width, height).data;

          // Dibuja la segunda imagen en el canvas temporal
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img2, 0, 0);
          const imageData2 = ctx.getImageData(0, 0, width, height).data;

          const comparisonCanvas = comparisonCanvasRef.current;
          if (!comparisonCanvas) return;
          comparisonCanvas.width = width;
          comparisonCanvas.height = height;
          const comparisonCtx = comparisonCanvas.getContext("2d");
          if (!comparisonCtx) return;
          const comparisonData = comparisonCtx.createImageData(width, height);

          let matchCount = 0;
          const totalPixels = width * height;

          for (let i = 0; i < imageData1.length; i += 4) {
            const r1 = imageData1[i];
            const g1 = imageData1[i + 1];
            const b1 = imageData1[i + 2];
            const a1 = imageData1[i + 3];

            const r2 = imageData2[i];
            const g2 = imageData2[i + 1];
            const b2 = imageData2[i + 2];
            const a2 = imageData2[i + 3];

            comparisonData.data[i] = r1;
            comparisonData.data[i + 1] = g1;
            comparisonData.data[i + 2] = b1;

            if (r1 === r2 && g1 === g2 && b1 === b2 && a1 === a2) {
              comparisonData.data[i + 3] = a1; // Píxel opaco
              matchCount++;
            } else {
              comparisonData.data[i + 3] = 128; // Píxel semitransparente
            }
          }

          comparisonCtx.putImageData(comparisonData, 0, 0);

          setSimilarityPercentage((matchCount / totalPixels) * 100);
          setComparisonImageUrl(comparisonCanvas.toDataURL());
        };
        img2.src = image2Url;
      };
      img1.src = image1Url;
    }
  }, [image1Url, image2Url]);

  const handleDoubleClick = useCallback(() => {
    setGlobalScale(1);
    setGlobalPosition({ x: 0, y: 0 });
  }, []);

  const handleSwapImages = () => {
    const tempUrl = image1Url;
    setImage1Url(image2Url);
    setImage2Url(tempUrl);
  };

  return (
    <div
      className="flex flex-col h-screen md:flex-row bg-gray-100 mt-2 gap-0"
      onDoubleClick={handleDoubleClick}
    >
      {/* Canvas temporal para la comparación de píxeles, oculto */}
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      <canvas ref={comparisonCanvasRef} style={{ display: "none" }}></canvas>

      {/* Primer Drag and Drop */}
      <div
        className={`
        ${containerClass} 
        ${isSecondImageLoaded ? "h-[95vh]" : "h-[95vh]"} 
        transition-all duration-500 rounded-lg shadow-lg flex flex-col justify-center items-center bg-white
      `}
      >
        <div
          {...getRootProps1()}
          className="relative w-full h-full flex flex-col items-center justify-center"
        >
          <input {...getInputProps1()} />
          {image1Url ? (
            <>
              <DraggableImage
                scale={globalScale}
                position={globalPosition}
                onWheel={onWheel}
                onMouseDown={onMouseDown}
                isDragging={isDragging}
              >
                <img
                  src={image1Url}
                  alt="Imagen 1"
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
              <span className="text-blue-500">primera imagen</span>
            </p>
          )}
        </div>
      </div>

      {/* Segundo Drag and Drop */}
      <div
        className={`
        ${containerClass} 
        ${isSecondImageLoaded ? "h-[95vh]" : "h-[95vh]"} 
        transition-all duration-500 rounded-lg shadow-lg flex flex-col justify-center items-center bg-white
      `}
      >
        <div
          {...getRootProps2()}
          className="relative w-full h-full flex flex-col items-center justify-center"
        >
          <input {...getInputProps2()} />
          {image2Url ? (
            <>
              <DraggableImage
                scale={globalScale}
                position={globalPosition}
                onWheel={onWheel}
                onMouseDown={onMouseDown}
                isDragging={isDragging}
              >
                <img
                  src={image2Url}
                  alt="Imagen 2"
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
              <span className="text-green-500">segunda imagen</span>
            </p>
          )}
        </div>
      </div>

      {/* Imagen de Comparación */}
      {isSecondImageLoaded && comparisonImageUrl && (
        <div
          className={`
          ${containerClass} 
          h-[95vh] transition-all duration-500 rounded-lg shadow-lg flex flex-col justify-center items-center bg-white
        `}
        >
          <DraggableImage
            scale={globalScale}
            position={globalPosition}
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            isDragging={isDragging}
          >
            <img
              src={comparisonImageUrl}
              alt="Imagen de Comparación"
              className="w-full h-full object-contain"
            />
          </DraggableImage>
          <div className="absolute top-4 right-4 bg-gray-800 text-white text-lg px-4 py-2 rounded-full opacity-75 font-bold">
            Similitud:{" "}
            {similarityPercentage !== null
              ? similarityPercentage.toFixed(2)
              : "N/A"}
            %
          </div>
        </div>
      )}

      {/* Botón para intercambiar imágenes y mensaje de doble clic */}
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
