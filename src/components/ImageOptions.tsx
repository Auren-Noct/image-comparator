import { useImageComparator } from "../context/ImageComparatorContext";
import { useTheme } from "../context/ThemeContext";

/**
 * Componente que renderiza los checkboxes para controlar la visibilidad de la imagen de base,
 * similitudes y diferencias.
 * @returns Un elemento JSX con los checkboxes de opciones.
 */
const ImageOptions = () => {
  const {
    showBaseImage,
    setShowBaseImage,
    showSimilarities,
    setShowSimilarities,
    showDifferences,
    setShowDifferences,
  } = useImageComparator();
  const { darkMode } = useTheme();

  return (
    <div
      className={`absolute top-4 right-4 flex flex-col gap-2 p-2 rounded-lg shadow-md ${
        darkMode ? "bg-gray-700" : "bg-white bg-opacity-75"
      }`}
    >
      <label
        className={`inline-flex items-center text-sm font-medium cursor-pointer ${
          darkMode ? "text-gray-200" : "text-gray-800"
        }`}
      >
        <input
          type="checkbox"
          checked={showBaseImage}
          onChange={(e) => setShowBaseImage(e.target.checked)}
          className="form-checkbox text-blue-600 rounded"
        />
        <span className="ml-2">Mostrar Fondo</span>
      </label>
      <label
        className={`inline-flex items-center text-sm font-medium cursor-pointer ${
          darkMode ? "text-gray-200" : "text-gray-800"
        }`}
      >
        <input
          type="checkbox"
          checked={showSimilarities}
          onChange={(e) => setShowSimilarities(e.target.checked)}
          className="form-checkbox text-blue-600 rounded"
        />
        <span className="ml-2">Mostrar Similitudes</span>
      </label>
      <label
        className={`inline-flex items-center text-sm font-medium cursor-pointer ${
          darkMode ? "text-gray-200" : "text-gray-800"
        }`}
      >
        <input
          type="checkbox"
          checked={showDifferences}
          onChange={(e) => setShowDifferences(e.target.checked)}
          className="form-checkbox text-blue-600 rounded"
        />
        <span className="ml-2">Mostrar Diferencias</span>
      </label>
    </div>
  );
};

export default ImageOptions;
