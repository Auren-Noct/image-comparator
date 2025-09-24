import { createContext, useContext, type ReactNode } from "react";

/**
 * Define el estado de los resultados del procesamiento de imágenes.
 */
interface ComparisonResultState {
  comparisonImageUrl: string | null;
  similarityPercentage: number | null;
  isProcessing: boolean;
  tempCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  comparisonCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const ComparisonResultContext = createContext<
  ComparisonResultState | undefined
>(undefined);

/**
 * Hook para consumir el estado de los resultados de la comparación.
 * @returns {ComparisonResultState} El estado actual de los resultados.
 * @throws {Error} Si se usa fuera de un `ComparisonResultProvider`.
 */
export const useComparisonResult = () => {
  const context = useContext(ComparisonResultContext);
  if (!context) {
    throw new Error(
      "useComparisonResult debe ser usado dentro de un ComparisonResultProvider"
    );
  }
  return context;
};

/**
 * Proveedor que almacena los resultados del procesamiento de imágenes.
 * @param {object} props - Las props del componente.
 * @param {ReactNode} props.children - Los componentes hijos que tendrán acceso al contexto.
 * @param {ComparisonResultState} props.value - El valor del estado a proveer.
 */
export const ComparisonResultProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: ComparisonResultState;
}) => {
  return (
    <ComparisonResultContext.Provider value={value}>
      {children}
    </ComparisonResultContext.Provider>
  );
};
