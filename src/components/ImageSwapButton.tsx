import { useImageComparator } from "../context/ImageComparatorContext";

/**
 * @description
 * Componente que renderiza el botón para intercambiar la primera y segunda imagen.
 * Obtiene la lógica y el estado directamente del contexto.
 * @returns {JSX.Element | null} El botón de intercambio o null si las imágenes no están cargadas.
 */
const ImageSwapButton = () => {
  const { image1Url, image2Url, handleSwapImages } = useImageComparator();

  // El botón solo se muestra cuando ambas imágenes están cargadas.
  if (!image1Url || !image2Url) {
    return null;
  }

  return (
    <button
      onClick={handleSwapImages}
      className="px-6 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-300"
    >
      Intercambiar Imágenes
    </button>
  );
};

export default ImageSwapButton;
