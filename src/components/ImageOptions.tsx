import { useImageComparator } from "../context/ImageComparatorContext";

/**
 * @description
 * Componente que renderiza los checkboxes para controlar la visibilidad
 * de la imagen de base, similitudes y diferencias. Obtiene su estado
 * y la lógica de actualización directamente del contexto.
 * @returns {JSX.Element} Un div con los checkboxes.
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

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 p-2 bg-white bg-opacity-75 rounded-lg shadow-md">
      <label className="inline-flex items-center text-sm font-medium text-gray-800">
        <input
          type="checkbox"
          checked={showBaseImage}
          onChange={(e) => setShowBaseImage(e.target.checked)}
          className="form-checkbox text-blue-600 rounded"
        />
        <span className="ml-2">Mostrar Fondo</span>
      </label>
      <label className="inline-flex items-center text-sm font-medium text-gray-800">
        <input
          type="checkbox"
          checked={showSimilarities}
          onChange={(e) => setShowSimilarities(e.target.checked)}
          className="form-checkbox text-blue-600 rounded"
        />
        <span className="ml-2">Mostrar Similitudes</span>
      </label>
      <label className="inline-flex items-center text-sm font-medium text-gray-800">
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
