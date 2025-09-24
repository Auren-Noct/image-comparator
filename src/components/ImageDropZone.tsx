import type { DropzoneState } from "react-dropzone";
import DraggableImage from "./DraggableImage";
import { memo } from "react";
import { useViewport, useViewportActions } from "../context/ViewportContext";
import { useTheme } from "../context/ThemeContext";
import type { ImageInfo } from "../context/ImageDataContext";
import ImageDetailsOverlay from "./ImageDetailsOverlay";
import Spinner from "./Spinner";

/**
 * Propiedades para el componente ImageDropZone.
 */
interface ImageDropZoneProps {
  /**
   * El objeto con la información de la imagen a mostrar.
   */
  imageInfo: ImageInfo | null;
  /**
   * Las propiedades de Dropzone para la zona de arrastre.
   */
  dropzoneProps: DropzoneState;
  /**
   * Indica si se deben mostrar los detalles de la imagen.
   */
  showDetails: boolean;
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
  /**
   * Indica si la imagen se está cargando.
   */
  isLoading: boolean;
}

/**
 * Componente reutilizable para el área de arrastrar y soltar con imagen y zoom.
 * @returns Un elemento JSX que representa la zona de carga de imágenes.
 */
const ImageDropZone = ({
  imageInfo,
  dropzoneProps,
  showDetails,
  title,
  titleColorClass,
  zoomPercentage,
  isLoading,
}: ImageDropZoneProps) => {
  const { darkMode } = useTheme();
  const { globalScale, globalPosition, isDragging } = useViewport();
  const { handleWheel, handleMouseDown } = useViewportActions();

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center"
      {...dropzoneProps.getRootProps()}
    >
      <label htmlFor={dropzoneProps.inputRef.current?.id} className="sr-only">
        {title}
      </label>
      <input
        {...dropzoneProps.getInputProps()}
        aria-label={`Cargar ${title}`}
      />
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-2">
          <Spinner />
          <p
            className={`text-center font-semibold ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Procesando imagen...
          </p>
        </div>
      ) : imageInfo ? (
        <>
          {/* Contenedor que define el área visual y recorta el contenido */}
          <div className="relative w-full h-full overflow-hidden">
            <DraggableImage
              scale={globalScale}
              position={globalPosition}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              isDragging={isDragging}
            >
              <img
                src={imageInfo.url}
                alt={title}
                className="w-full h-full object-contain"
              />
            </DraggableImage>
          </div>
          {showDetails && <ImageDetailsOverlay imageInfo={imageInfo} />}
          <div
            className={`absolute top-4 right-4 text-sm px-2 py-1 rounded-full opacity-75 ${
              darkMode ? "bg-gray-700 text-white" : "bg-gray-800 text-white"
            }`}
          >
            Zoom: {zoomPercentage !== null ? zoomPercentage.toFixed(0) : "N/A"}%
          </div>
        </>
      ) : (
        <p
          className={`text-center font-bold select-none p-4 ${
            darkMode ? "text-gray-400" : "text-gray-700"
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
