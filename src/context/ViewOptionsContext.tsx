import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
  useState,
  useEffect,
} from "react";

/**
 * Hook genérico para crear un estado que persiste en localStorage.
 * @param key La clave para usar en localStorage.
 * @param defaultValue El valor por defecto si no hay nada en localStorage.
 * @returns Una tupla con el estado y la función para actualizarlo.
 */
const usePersistentState = <T,>(
  key: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? (JSON.parse(storedValue) as T) : defaultValue;
    } catch (error) {
      console.error(`Error al leer la clave "${key}" de localStorage:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

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
  const [showBaseImage, setShowBaseImage] = usePersistentState(
    "viewOption_showBaseImage",
    true
  );
  const [showSimilarities, setShowSimilarities] = usePersistentState(
    "viewOption_showSimilarities",
    true
  );
  const [showDifferences, setShowDifferences] = usePersistentState(
    "viewOption_showDifferences",
    true
  );
  const [showDetails, setShowDetails] = usePersistentState(
    "viewOption_showDetails",
    false
  );

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
    [
      showBaseImage,
      setShowBaseImage,
      showSimilarities,
      setShowSimilarities,
      showDifferences,
      setShowDifferences,
      showDetails,
      setShowDetails,
    ]
  );

  return (
    <ViewOptionsContext.Provider value={value}>
      {children}
    </ViewOptionsContext.Provider>
  );
};
