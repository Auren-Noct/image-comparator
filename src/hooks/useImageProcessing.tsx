import { useEffect, useRef, useState } from "react";

/**
 * Hook personalizado para manejar la lógica de procesamiento de imágenes.
 * Encapsula la carga, comparación y visualización de imágenes en un canvas.
 * @param {string | null} image1Url - La URL de la primera imagen.
 * @param {string | null} image2Url - La URL de la segunda imagen.
 * @param {boolean} showSimilarities - Muestra los píxeles similares en verde.
 * @param {boolean} showDifferences - Muestra los píxeles diferentes en rojo.
 * @param {boolean} showBaseImage - Mantiene la imagen base debajo de la superposición.
 */
export const useImageProcessing = (
  image1Url: string | null,
  image2Url: string | null,
  showSimilarities: boolean,
  showDifferences: boolean,
  showBaseImage: boolean
) => {
  const [comparisonImageUrl, setComparisonImageUrl] = useState<string | null>(
    null
  );
  const [similarityPercentage, setSimilarityPercentage] = useState<
    number | null
  >(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const comparisonCanvasRef = useRef<HTMLCanvasElement | null>(null);

  /**
   * Carga una imagen asincrónicamente y devuelve un Promise.
   * @param {string} src - La URL de la imagen.
   * @returns {Promise<HTMLImageElement>} La imagen cargada.
   */
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  useEffect(() => {
    const processImages = async () => {
      if (!image1Url || !image2Url) {
        setComparisonImageUrl(null);
        setSimilarityPercentage(null);
        return;
      }

      try {
        // Carga ambas imágenes de forma asincrónica y en paralelo
        const [firstImage, secondImage] = await Promise.all([
          loadImage(image1Url),
          loadImage(image2Url),
        ]);

        const width = Math.max(firstImage.width, secondImage.width);
        const height = Math.max(firstImage.height, secondImage.height);

        const tempCanvas = tempCanvasRef.current;
        const comparisonCanvas = comparisonCanvasRef.current;
        if (!tempCanvas || !comparisonCanvas) return;

        // Dibuja la primera imagen en el canvas temporal para obtener los datos de píxeles
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCanvasContext = tempCanvas.getContext("2d");
        if (!tempCanvasContext) return;
        tempCanvasContext.drawImage(firstImage, 0, 0);
        const firstImageData = tempCanvasContext.getImageData(
          0,
          0,
          width,
          height
        ).data;

        // Dibuja la segunda imagen en el mismo canvas temporal
        tempCanvasContext.clearRect(0, 0, width, height);
        tempCanvasContext.drawImage(secondImage, 0, 0);
        const secondImageData = tempCanvasContext.getImageData(
          0,
          0,
          width,
          height
        ).data;

        // Prepara el canvas de comparación
        comparisonCanvas.width = width;
        comparisonCanvas.height = height;
        const comparisonCanvasContext = comparisonCanvas.getContext("2d");
        if (!comparisonCanvasContext) return;
        const comparisonData = comparisonCanvasContext.createImageData(
          width,
          height
        );

        let matchCount = 0;
        const totalPixels = width * height;

        const similarityColor = [0, 255, 0]; // Verde
        const differenceColor = [255, 0, 0]; // Rojo
        const overlayAlpha = showBaseImage ? 128 : 255; // Sigue el principio de inmutabilidad

        // Itera sobre los datos de píxeles para comparar y dibujar
        for (let i = 0; i < firstImageData.length; i += 4) {
          // Compara los valores RGB y Alpha de los píxeles
          const isMatch =
            firstImageData[i] === secondImageData[i] &&
            firstImageData[i + 1] === secondImageData[i + 1] &&
            firstImageData[i + 2] === secondImageData[i + 2] &&
            firstImageData[i + 3] === secondImageData[i + 3];

          if (isMatch) {
            matchCount++;
            if (showSimilarities) {
              comparisonData.data[i] = similarityColor[0];
              comparisonData.data[i + 1] = similarityColor[1];
              comparisonData.data[i + 2] = similarityColor[2];
              comparisonData.data[i + 3] = overlayAlpha;
            } else {
              comparisonData.data[i + 3] = 0;
            }
          } else {
            if (showDifferences) {
              comparisonData.data[i] = differenceColor[0];
              comparisonData.data[i + 1] = differenceColor[1];
              comparisonData.data[i + 2] = differenceColor[2];
              comparisonData.data[i + 3] = overlayAlpha;
            } else {
              comparisonData.data[i + 3] = 0;
            }
          }
        }

        // Dibuja los resultados en el canvas de comparación
        comparisonCanvasContext.putImageData(comparisonData, 0, 0);

        setSimilarityPercentage((matchCount / totalPixels) * 100);
        setComparisonImageUrl(comparisonCanvas.toDataURL());
      } catch (error) {
        console.error("Error al procesar las imágenes:", error);
      }
    };

    processImages();
  }, [image1Url, image2Url, showSimilarities, showDifferences, showBaseImage]);

  return {
    comparisonImageUrl,
    similarityPercentage,
    tempCanvasRef,
    comparisonCanvasRef,
  };
};
