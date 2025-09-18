import type { DropzoneState } from "react-dropzone";
import DraggableImage from "./DraggableImage";
import { useRef } from "react";

/**
 * Propiedades para el componente ImageDropZone.
 */
interface ImageDropZoneProps {
  imageURL: string | null;
  dropzoneProps: DropzoneState;
  title: string;
  titleColorClass: string;
  zoomPercentage: number | null;
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
  zoomPercentage,
  globalScale,
  globalPosition,
  isDragging,
  handleWheel,
  handleMouseDown,
}: ImageDropZoneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
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
            Zoom: {zoomPercentage !== null ? zoomPercentage.toFixed(0) : "N/A"}%
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

export default ImageDropZone;
