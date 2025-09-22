import { useState, memo, useRef, useEffect } from "react";
import { useImageActions, useImageData } from "../context/ImageDataContext";
import { useTheme } from "../context/ThemeContext";
import { useViewOptions } from "../context/ViewOptionsContext";
import CheckboxOption from "./CheckboxOption";

/**
 * Componente de cabecera unificado que centraliza todas las acciones y opciones.
 * Integra la lógica de reinicio, cambio de tema, intercambio de imágenes y opciones de visualización.
 */
const Header = () => {
  // --- Hooks de Contexto ---
  const { handleResetImages, handleSwapImages } = useImageActions();
  const { image1Url, image2Url } = useImageData();
  const { darkMode, toggleTheme } = useTheme();
  const {
    showBaseImage,
    setShowBaseImage,
    showSimilarities,
    setShowSimilarities,
    showDifferences,
    setShowDifferences,
  } = useViewOptions();

  // --- Estado Local ---
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isCopyrightOpen, setIsCopyrightOpen] = useState(false);

  // --- Renderizado Condicional del Botón de Intercambio ---
  const renderSwapButton = () => {
    if (!image1Url || !image2Url) {
      return null;
    }
    return (
      <button
        onClick={handleSwapImages}
        className="px-3 py-1 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors text-sm whitespace-nowrap"
      >
        Intercambiar
      </button>
    );
  };

  // --- Hook para cerrar el copyright al hacer clic fuera ---
  const copyrightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        copyrightRef.current &&
        !copyrightRef.current.contains(event.target as Node)
      ) {
        setIsCopyrightOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [copyrightRef]);

  return (
    <header
      className={`relative w-full h-16 flex items-center justify-between px-4 py-3 border-b transition-colors z-20 ${
        darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-100 border-gray-200"
      }`}
    >
      {/* --- Grupo Izquierdo: Título y Reset --- */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400 hidden sm:block">
          Image Comparator
        </h1>
        <button
          className="px-3 py-1 bg-amber-500 text-white rounded-full font-semibold hover:bg-amber-600 transition-colors text-sm"
          onClick={handleResetImages}
        >
          Reiniciar App
        </button>
      </div>

      {/* --- Grupo Derecho: Controles y Opciones --- */}
      <div className="flex items-center gap-3">
        {renderSwapButton()}
        <button
          onClick={toggleTheme}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
        >
          {darkMode ? "Modo Claro" : "Modo Oscuro"}
        </button>

        {/* --- Menú Desplegable de Opciones --- */}
        <div className="relative">
          <button
            onClick={() => setIsOptionsOpen((prev) => !prev)}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            Opciones
          </button>
          {isOptionsOpen && (
            <div
              className={`absolute top-full right-0 mt-2 w-48 p-3 rounded-lg shadow-xl ${
                darkMode ? "bg-gray-700" : "bg-white"
              }`}
            >
              <div className="flex flex-col gap-2">
                <CheckboxOption
                  label="Mostrar Fondo"
                  checked={showBaseImage}
                  onChange={(e) => setShowBaseImage(e.target.checked)}
                />
                <CheckboxOption
                  label="Mostrar Similitudes"
                  checked={showSimilarities}
                  onChange={(e) => setShowSimilarities(e.target.checked)}
                />
                <CheckboxOption
                  label="Mostrar Diferencias"
                  checked={showDifferences}
                  onChange={(e) => setShowDifferences(e.target.checked)}
                />
              </div>
            </div>
          )}
        </div>

        {/* --- Copyright con Desplegable --- */}
        <div className="relative" ref={copyrightRef}>
          <button
            onClick={() => setIsCopyrightOpen((prev) => !prev)}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            Acerca de
          </button>
          {isCopyrightOpen && (
            <div
              className={`absolute top-full right-0 mt-2 w-56 p-3 rounded-lg shadow-xl ${
                darkMode ? "bg-gray-700" : "bg-white"
              }`}
            >
              <div className="flex flex-col gap-2 text-sm">
                <span>
                  © {new Date().getFullYear()} Walter Marcos Crespín. Todos los
                  derechos reservados.
                </span>
                <a
                  href="https://github.com/Auren-Noct"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  GitHub
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default memo(Header);
