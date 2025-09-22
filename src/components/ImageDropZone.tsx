import type { DropzoneState } from "react-dropzone";
import DraggableImage from "./DraggableImage";
import { memo } from "react";
import { useViewport, useViewportActions } from "../context/ViewportContext";
import { useTheme } from "../context/ThemeContext";

/**
 * Propiedades para el componente ImageDropZone.
 */
interface ImageDropZoneProps {
  /**
   * La URL de la imagen a mostrar.
   */
  imageURL: string | null;
  /**
   * Las propiedades de Dropzone para la zona de arrastre.
   */
  dropzoneProps: DropzoneState;
  /**
   * El título que se muestra en la zona de arrastre.
   */
  title: string;
  /**
   * La clase CSS de Tailwind para el color del título.
   */
  titleColorClass: string;
  /**
   * El porcentaje de zoom actual de la imagen.
   */
  zoomPercentage: number | null;
}

/**
 * Componente reutilizable para el área de arrastrar y soltar con imagen y zoom.
 * @returns Un elemento JSX que representa la zona de carga de imágenes.
 */
const ImageDropZone = ({
  imageURL,
  dropzoneProps,
  title,
  titleColorClass,
  zoomPercentage,
}: ImageDropZoneProps) => {
  const { darkMode } = useTheme();
  const { globalScale, globalPosition, isDragging } = useViewport();
  const { handleWheel, handleMouseDown } = useViewportActions();

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
          <div className="absolute top-4 right-4 bg-gray-800 text-white text-sm px-2 py-1 rounded-full opacity-75">
            Zoom: {zoomPercentage !== null ? zoomPercentage.toFixed(0) : "N/A"}%
          </div>
        </>
      ) : (
        <p
          className={`text-center font-bold select-none p-4 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Arrastra y suelta aquí la{" "}
          <span className={titleColorClass}>{title}</span>
        </p>
      )}
    </div>
  );
};

export default memo(ImageDropZone);
