import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

/**
 * Define la forma del contexto de opciones de visualización.
 */
interface ViewOptionsContextType {
  showBaseImage: boolean;
  setShowBaseImage: Dispatch<SetStateAction<boolean>>;
  showSimilarities: boolean;
  setShowSimilarities: Dispatch<SetStateAction<boolean>>;
  showDifferences: boolean;
  setShowDifferences: Dispatch<SetStateAction<boolean>>;
  showDetails: boolean;
  setShowDetails: Dispatch<SetStateAction<boolean>>;
}

const ViewOptionsContext = createContext<ViewOptionsContextType | undefined>(
  undefined
);

/**
 * Hook para consumir el contexto de opciones de visualización.
 */
export const useViewOptions = (): ViewOptionsContextType => {
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
 */
export const ViewOptionsProvider = ({ children }: { children: ReactNode }) => {
  const [showBaseImage, setShowBaseImage] = useState(true);
  const [showSimilarities, setShowSimilarities] = useState(true);
  const [showDifferences, setShowDifferences] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const value = useMemo(
    () => ({
      showBaseImage,
      setShowBaseImage,
      showSimilarities,
      setShowSimilarities,
      showDifferences,
      setShowDifferences,
      showDetails,
      setShowDetails,
    }),
    [showBaseImage, showSimilarities, showDifferences, showDetails]
  );

  return (
    <ViewOptionsContext.Provider value={value}>
      {children}
    </ViewOptionsContext.Provider>
  );
};
