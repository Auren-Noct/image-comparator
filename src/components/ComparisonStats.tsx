import { useImageComparator } from "../context/ImageComparatorContext";

/**
 * Componente que muestra los porcentajes de similitud y diferencia entre las imágenes.
 * Obtiene los valores directamente del contexto `ImageComparatorContext`.
 * @returns Un elemento JSX que muestra las estadísticas de la comparación.
 */
const ComparisonStats = () => {
  const { similarityPercentage, differencePercentage } = useImageComparator();

  return (
    <div className="absolute top-4 left-4 bg-gray-800 text-white text-sm px-2 py-1 rounded-full opacity-75 flex flex-col items-end">
      <span>
        Similitud:{" "}
        {similarityPercentage !== null
          ? similarityPercentage.toFixed(2)
          : "N/A"}{" "}
        %
      </span>
      <span>
        Diferencia:{" "}
        {differencePercentage !== null
          ? differencePercentage.toFixed(2)
          : "N/A"}{" "}
        %
      </span>
    </div>
  );
};

export default ComparisonStats;
