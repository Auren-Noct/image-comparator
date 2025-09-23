import type { ImageInfo } from "../context/ImageDataContext";
import { useTheme } from "../context/ThemeContext";

interface ImageDetailsOverlayProps {
  imageInfo: ImageInfo;
}

/**
 * Formatea el tamaño de un archivo de bytes a un formato legible.
 * @param bytes El tamaño en bytes.
 * @returns El tamaño formateado como string.
 */
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/**
 * Componente que muestra una superposición con los detalles de la imagen.
 * @param {ImageDetailsOverlayProps} props Las propiedades del componente.
 * @returns Un elemento JSX con los detalles de la imagen.
 */
const ImageDetailsOverlay = ({ imageInfo }: ImageDetailsOverlayProps) => {
  const { darkMode } = useTheme();
  return (
    <div
      className={`absolute top-4 left-4 text-white text-xs px-2 py-1 rounded-lg opacity-85 select-none max-w-xs ${
        darkMode ? "bg-gray-700" : "bg-gray-800"
      }`}
    >
      <ul className="flex flex-col gap-1">
        <li className="flex items-center gap-1" title={imageInfo.name}>
          <strong>Nombre:</strong>
          {/* Se trunca el nombre para evitar desbordamiento */}
          <span className="truncate">{imageInfo.name}</span>
        </li>
        <li>
          <strong>Dimensiones:</strong> {imageInfo.width} x {imageInfo.height}
        </li>
        <li>
          <strong>Tamaño:</strong> {formatBytes(imageInfo.size)}
        </li>
        <li>
          <strong>Tipo:</strong> {imageInfo.type}
        </li>
        <li>
          <strong>Modificado:</strong>{" "}
          {new Date(imageInfo.lastModified).toLocaleString()}
        </li>
      </ul>
    </div>
  );
};

export default ImageDetailsOverlay;
