import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";

/**
 * Define el estado de las opciones de visualización.
 */
interface ViewOptionsState {
  showBaseImage: boolean;
  setShowBaseImage: (value: boolean) => void;
  showSimilarities: boolean;
  setShowSimilarities: (value: boolean) => void;
  showDifferences: boolean;
  setShowDifferences: (value: boolean) => void;
}

const ViewOptionsContext = createContext<ViewOptionsState | undefined>(
  undefined
);

/**
 * Hook para consumir el estado de las opciones de visualización.
 * @returns {ViewOptionsState} El estado actual de las opciones de visualización y sus setters.
 * @throws {Error} Si se usa fuera de un `ViewOptionsProvider`.
 */
export const useViewOptions = () => {
  const context = useContext(ViewOptionsContext);
  if (!context) {
    throw new Error(
      "useViewOptions debe ser usado dentro de un ViewOptionsProvider"
    );
  }
  return context;
};

/**
 * Proveedor que gestiona el estado de las opciones de visualización.
 * @param {object} props - Las props del componente.
 * @param {ReactNode} props.children - Los componentes hijos que tendrán acceso al contexto.
 */
export const ViewOptionsProvider = ({ children }: { children: ReactNode }) => {
  const [showBaseImage, setShowBaseImage] = useState<boolean>(true);
  const [showSimilarities, setShowSimilarities] = useState<boolean>(true);
  const [showDifferences, setShowDifferences] = useState<boolean>(true);

  const value = useMemo(
    () => ({
      showBaseImage,
      setShowBaseImage,
      showSimilarities,
      setShowSimilarities,
      showDifferences,
      setShowDifferences,
    }),
    [showBaseImage, showSimilarities, showDifferences]
  );

  return (
    <ViewOptionsContext.Provider value={value}>
      {children}
    </ViewOptionsContext.Provider>
  );
};
