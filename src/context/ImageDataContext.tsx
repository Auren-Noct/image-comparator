import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  useDropzone,
  type DropzoneState,
  type FileRejection,
} from "react-dropzone";
import { useNotification } from "./NotificationContext";

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
  isLoading1: boolean;
  isLoading2: boolean;
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
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const { showNotification } = useNotification();

  const handleFile = useCallback(
    (
      file: File,
      setImage: (info: ImageInfo | null) => void,
      setIsLoading: (loading: boolean) => void
    ) => {
      setIsLoading(true);
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
          setIsLoading(false);
        };
        img.src = e.target?.result as string;
        img.onerror = (error) => {
          // Manejo explícito de errores si el archivo no es una imagen válida
          console.error("Error al cargar el archivo de imagen:", error);
          showNotification(
            "El archivo seleccionado no es una imagen válida o está corrupto. Por favor, intente con otro archivo."
          );
          setIsLoading(false);
        };
      };
      reader.readAsDataURL(file);
    },
    [showNotification]
  );

  /**
   * Crea un manejador onDrop para una zona de carga específica.
   * Centraliza la lógica de manejo de errores (DRY).
   * @param setImage La función para actualizar el estado de la imagen correspondiente.
   */
  const createOnDropHandler = useCallback(
    (
        setImage: (info: ImageInfo | null) => void,
        setIsLoading: (loading: boolean) => void
      ) =>
      (acceptedFiles: File[], fileRejections: FileRejection[]) => {
        // Fail Fast: Manejo centralizado y específico de errores de carga.
        if (fileRejections.length > 0) {
          const firstError = fileRejections[0].errors[0];
          let errorMessage: string;

          // Un switch completo para manejar todos los errores posibles de react-dropzone.
          switch (firstError.code) {
            case "file-invalid-type":
              errorMessage =
                "Tipo de archivo no válido. Solo se admiten imágenes.";
              break;
            case "file-too-large":
              errorMessage =
                "El archivo es demasiado grande. El tamaño máximo es de 50MB.";
              break;
            case "file-too-small":
              errorMessage = "El archivo es demasiado pequeño.";
              break;
            case "too-many-files":
              errorMessage = "Solo puedes subir una imagen a la vez.";
              break;
            default:
              errorMessage = "El archivo no pudo ser cargado.";
              break;
          }
          showNotification(errorMessage);
          return; // Detiene la ejecución si hay errores.
        }
        if (acceptedFiles.length > 0) {
          handleFile(acceptedFiles[0], setImage, setIsLoading);
        }
      },
    [handleFile, showNotification]
  );

  const dropzoneOptions = {
    noClick: true,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50 MB
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/gif": [],
      "image/bmp": [],
    },
  };
  const dropzoneProps1 = useDropzone({
    onDrop: createOnDropHandler(setImage1, setIsLoading1),
    ...dropzoneOptions,
  });
  const dropzoneProps2 = useDropzone({
    onDrop: createOnDropHandler(setImage2, setIsLoading2),
    ...dropzoneOptions,
  });

  const handleResetImages = useCallback(() => {
    setImage1(null);
    setImage2(null);
  }, []);

  const handleSwapImages = useCallback(() => {
    setImage1(image2);
    setImage2(image1);
  }, [image1, image2]);

  const imageDataValue = useMemo(
    () => ({ image1, image2, isLoading1, isLoading2 }),
    [image1, image2, isLoading1, isLoading2]
  );
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
