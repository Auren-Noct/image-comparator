import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Define la forma del contexto del tema.
 * @interface ThemeContextType
 */
interface ThemeContextType {
  /** Indica si el tema oscuro está activo. */
  darkMode: boolean;
  /** Función para alternar entre el tema claro y el oscuro. */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Hook personalizado para consumir el contexto del tema.
 *
 * @returns {ThemeContextType} El objeto de contexto con el estado y la lógica del tema.
 * @throws {Error} Si se usa fuera de un `ThemeProvider`.
 * @example
 * ```
 * const { darkMode, toggleTheme } = useTheme();
 * ```
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme debe ser usado dentro de un ThemeProvider");
  }
  return context;
};

/**
 * Hook para manejar el estado del tema con persistencia en localStorage.
 * La lógica de negocio está separada del componente de presentación.
 *
 * @returns {object} Un objeto con el estado del tema y la función para alternarlo.
 * @property {boolean} darkMode - El estado actual del tema.
 * @property {() => void} toggleTheme - La función para cambiar el tema.
 */
const useThemeState = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Fail-fast: Captura de errores al acceder a localStorage.
    try {
      const storedTheme = window.localStorage.getItem("theme");
      return storedTheme === "dark";
    } catch (error: unknown) {
      console.error("No se pudo acceder a localStorage", error);
      // Falla rápido y usa un valor por defecto seguro.
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
  });

  // Efecto para sincronizar el estado del tema con localStorage.
  useEffect(() => {
    // Fail-fast: Captura de errores al guardar en localStorage.
    try {
      window.localStorage.setItem("theme", darkMode ? "dark" : "light");
    } catch (error: unknown) {
      console.error("No se pudo guardar en localStorage", error);
    }
  }, [darkMode]);

  // Se usa `useCallback` para memorizar la función y evitar recreaciones innecesarias.
  const toggleTheme = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  // Se usa `useMemo` para evitar la recreación del objeto de valor en cada render.
  const value = useMemo(
    () => ({
      darkMode,
      toggleTheme,
    }),
    [darkMode, toggleTheme]
  );

  return value;
};

/**
 * Componente proveedor que gestiona el estado global del tema.
 *
 * @param {object} props - Las props del componente.
 * @param {ReactNode} props.children - Los componentes hijos que tendrán acceso al contexto.
 */
const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { darkMode, toggleTheme } = useThemeState();

  const themeClassName = darkMode
    ? "dark bg-gray-900 text-white"
    : "bg-gray-100 text-gray-900";

  // Se delega el estilo al componente padre para que los hijos no tengan que preocuparse por él.
  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <div
        className={`w-full min-h-screen font-sans flex flex-col ${themeClassName}`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
