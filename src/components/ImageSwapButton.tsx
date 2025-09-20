import { useImageComparator } from "../context/ImageComparatorContext";

/**
 * Componente que renderiza un botón para intercambiar la primera y segunda imagen.
 * @returns Un elemento JSX con el botón de intercambio, o `null` si las imágenes no están cargadas.
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
