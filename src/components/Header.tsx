import { useTheme } from "../context/ThemeContext";

const Header = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <header
      className={`w-full flex justify-between items-center p-4 shadow-md transition-colors ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex items-center space-x-4">
        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          onClick={() => console.log("Reiniciar la app")}
        >
          Reiniciar App
        </button>
        <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
          <input type="checkbox" className="form-checkbox rounded" />
          <span>Mostrar Información</span>
        </label>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {darkMode ? "Modo Claro" : "Modo Oscuro"}
        </button>
        <a
          href="https://github.com/Auren-Noct/image-comparator"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-medium hover:underline dark:text-blue-400"
        >
          Mi GitHub
        </a>
      </div>
    </header>
  );
};

export default Header;
