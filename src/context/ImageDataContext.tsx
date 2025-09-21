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
 * Define el estado de los datos de las imágenes.
 */
interface ImageDataState {
  image1Url: string | null;
  image2Url: string | null;
  image1Dimensions: { width: number; height: number } | null;
  image2Dimensions: { width: number; height: number } | null;
  isSecondImageLoaded: boolean;
}

/**
 * Define las acciones que se pueden realizar sobre las imágenes.
 */
interface ImageActions {
  handleSwapImages: () => void;
  handleResetImages: () => void;
  dropzoneProps1: DropzoneState;
  dropzoneProps2: DropzoneState;
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

  const handleImageDrop = useCallback(
    (
        setterUrl: (url: string | null) => void,
        setterDims: (dims: { width: number; height: number } | null) => void
      ) =>
      (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const dims = { width: img.width, height: img.height };
            setterDims(dims);
            setterUrl(reader.result as string);
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      },
    []
  );

  const dropzoneProps1 = useDropzone({
    onDrop: handleImageDrop(setImage1Url, setImage1Dimensions),
    noClick: true,
    accept: { "image/*": [] },
  });

  const dropzoneProps2 = useDropzone({
    onDrop: handleImageDrop(setImage2Url, setImage2Dimensions),
    noClick: true,
    accept: { "image/*": [] },
  });

  const handleSwapImages = useCallback(() => {
    setImage1Url(image2Url);
    setImage2Url(image1Url);
    setImage1Dimensions(image2Dimensions);
    setImage2Dimensions(image1Dimensions);
  }, [image1Url, image2Url, image1Dimensions, image2Dimensions]);

  const handleResetImages = useCallback(() => {
    setImage1Url(null);
    setImage2Url(null);
    setImage1Dimensions(null);
    setImage2Dimensions(null);
  }, []);

  const dataValue = useMemo(
    () => ({
      image1Url,
      image2Url,
      image1Dimensions,
      image2Dimensions,
      isSecondImageLoaded: image2Url !== null,
    }),
    [image1Url, image2Url, image1Dimensions, image2Dimensions]
  );

  const actionsValue = useMemo(
    () => ({
      handleSwapImages,
      handleResetImages,
      dropzoneProps1,
      dropzoneProps2,
    }),
    [handleSwapImages, handleResetImages, dropzoneProps1, dropzoneProps2]
  );

  return (
    <ImageDataContext.Provider value={dataValue}>
      <ImageActionsContext.Provider value={actionsValue}>
        {children}
      </ImageActionsContext.Provider>
    </ImageDataContext.Provider>
  );
};
