import { useMemo, memo } from "react";
import { useComparisonResult } from "../context/ComparisonResultContext";
import { useTheme } from "../context/ThemeContext";

/**
 * Componente que muestra los porcentajes de similitud y diferencia entre las imágenes.
 * Obtiene los valores directamente del contexto `ComparisonResultContext`.
 * @returns Un elemento JSX que muestra las estadísticas de la comparación.
 */
const ComparisonStats = () => {
  const { similarityPercentage } = useComparisonResult();
  const differencePercentage = useMemo(() => {
    return similarityPercentage !== null ? 100 - similarityPercentage : null;
  }, [similarityPercentage]);
  const { darkMode } = useTheme();

  return (
    <div
      className={`absolute top-4 left-4 text-sm px-2 py-1 rounded-full opacity-75 flex flex-col items-end ${
        darkMode ? "bg-gray-700 text-white" : "bg-gray-800 text-white"
      }`}
    >
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

export default memo(ComparisonStats);
