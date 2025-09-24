import { useTheme } from "../context/ThemeContext";

/**
 * Componente de spinner para indicar estados de carga.
 */
const Spinner = () => {
  const { darkMode } = useTheme();
  return (
    <div
      className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin ${
        darkMode ? "border-blue-300" : "border-blue-600"
      }`}
    ></div>
  );
};

export default Spinner;
