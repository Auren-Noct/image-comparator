import { useViewOptions } from "../context/ViewOptionsContext";
import { useTheme } from "../context/ThemeContext";
import CheckboxOption from "./CheckboxOption";

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
  } = useViewOptions();
  const { darkMode } = useTheme();

  return (
    <div
      className={`absolute top-4 right-4 flex flex-col gap-2 p-2 rounded-lg shadow-md ${
        darkMode ? "bg-gray-700" : "bg-white bg-opacity-75"
      }`}
    >
      <CheckboxOption
        label="Mostrar Fondo"
        checked={showBaseImage}
        onChange={(e) => setShowBaseImage(e.target.checked)}
      />
      <CheckboxOption
        label="Mostrar Similitudes"
        checked={showSimilarities}
        onChange={(e) => setShowSimilarities(e.target.checked)}
      />
      <CheckboxOption
        label="Mostrar Diferencias"
        checked={showDifferences}
        onChange={(e) => setShowDifferences(e.target.checked)}
      />
    </div>
  );
};

export default ImageOptions;
