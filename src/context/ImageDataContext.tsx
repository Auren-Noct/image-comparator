import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useDropzone, type DropzoneState } from "react-dropzone";

/**
 * Información detallada de una imagen cargada.
 */
export interface ImageInfo {
  url: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  width: number;
  height: number;
}

/**
 * Estado de los datos de las imágenes.
 */
interface ImageDataState {
  image1: ImageInfo | null;
  image2: ImageInfo | null;
}

/**
 * Acciones disponibles para manipular las imágenes.
 */
interface ImageActions {
  dropzoneProps1: DropzoneState;
  dropzoneProps2: DropzoneState;
  handleResetImages: () => void;
  handleSwapImages: () => void;
}

const ImageDataContext = createContext<ImageDataState | undefined>(undefined);
const ImageActionsContext = createContext<ImageActions | undefined>(undefined);

/**
 * Hook para consumir el estado de los datos de las imágenes.
 * @returns {ImageDataState} El estado actual de las imágenes.
 * @throws {Error} Si se usa fuera de un `ImageDataProvider`.
 */
export const useImageData = () => {
  const context = useContext(ImageDataContext);
  if (!context) {
    throw new Error(
      "useImageData debe ser usado dentro de un ImageDataProvider"
    );
  }
  return context;
};

/**
 * Hook para consumir las acciones disponibles para las imágenes.
 * @returns {ImageActions} Un objeto con las funciones para manipular las imágenes.
 * @throws {Error} Si se usa fuera de un `ImageDataProvider`.
 */
export const useImageActions = () => {
  const context = useContext(ImageActionsContext);
  if (!context) {
    throw new Error(
      "useImageActions debe ser usado dentro de un ImageDataProvider"
    );
  }
  return context;
};

/**
 * Proveedor que gestiona el estado y las acciones relacionadas con los datos de las imágenes.
 * @param {object} props - Las props del componente.
 * @param {ReactNode} props.children - Los componentes hijos que tendrán acceso al contexto.
 */
export const ImageDataProvider = ({ children }: { children: ReactNode }) => {
  const [image1, setImage1] = useState<ImageInfo | null>(null);
  const [image2, setImage2] = useState<ImageInfo | null>(null);

  const handleFile = useCallback(
    (file: File, setImage: (info: ImageInfo | null) => void) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const imageInfo: ImageInfo = {
            url: img.src,
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            width: img.width,
            height: img.height,
          };
          setImage(imageInfo);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const onDrop1 = useCallback(
    (acceptedFiles: File[]) => handleFile(acceptedFiles[0], setImage1),
    [handleFile]
  );
  const onDrop2 = useCallback(
    (acceptedFiles: File[]) => handleFile(acceptedFiles[0], setImage2),
    [handleFile]
  );

  const dropzoneProps1 = useDropzone({ onDrop: onDrop1, noClick: true });
  const dropzoneProps2 = useDropzone({ onDrop: onDrop2, noClick: true });

  const handleResetImages = useCallback(() => {
    setImage1(null);
    setImage2(null);
  }, []);

  const handleSwapImages = useCallback(() => {
    setImage1(image2);
    setImage2(image1);
  }, [image1, image2]);

  const imageDataValue = useMemo(() => ({ image1, image2 }), [image1, image2]);
  const imageActionsValue = useMemo(
    () => ({
      dropzoneProps1,
      dropzoneProps2,
      handleResetImages,
      handleSwapImages,
    }),
    [dropzoneProps1, dropzoneProps2, handleResetImages, handleSwapImages]
  );

  return (
    <ImageDataContext.Provider value={imageDataValue}>
      <ImageActionsContext.Provider value={imageActionsValue}>
        {children}
      </ImageActionsContext.Provider>
    </ImageDataContext.Provider>
  );
};
