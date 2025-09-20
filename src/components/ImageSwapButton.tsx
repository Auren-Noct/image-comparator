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
      className="cursor-pointer rounded-full bg-blue-500 px-4 py-2 text-white shadow-lg transition-all duration-300 scale-90 opacity-50 hover:scale-100 hover:opacity-100 focus:scale-100 focus:opacity-100"
    >
      Intercambiar Imágenes
    </button>
  );
};

export default ImageSwapButton;
