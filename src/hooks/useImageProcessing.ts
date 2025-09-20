import { useEffect, useRef, useState } from "react";
import ImageWorker from "../workers/imageWorker?worker";

/**
 * Hook personalizado para manejar la lógica de procesamiento de imágenes
 * de forma asíncrona usando un Web Worker.
 *
 * @param image1Url La URL de la primera imagen.
 * @param image2Url La URL de la segunda imagen.
 * @param showSimilarities Muestra los píxeles similares en verde.
 * @param showDifferences Muestra los píxeles diferentes en rojo.
 * @param showBaseImage Mantiene la imagen base debajo de la superposición.
 * @returns {object} Un objeto con la URL de la imagen de comparación, el porcentaje
 * de similitud y las referencias a los canvas.
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
   * Carga una imagen asincrónicamente.
   * @param src La URL de la imagen.
   * @returns La imagen cargada.
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

      const worker = new ImageWorker();

      try {
        const [firstImage, secondImage] = await Promise.all([
          loadImage(image1Url),
          loadImage(image2Url),
        ]);

        const width = Math.max(firstImage.width, secondImage.width);
        const height = Math.max(firstImage.height, secondImage.height);

        const tempCanvas = tempCanvasRef.current;
        const comparisonCanvas = comparisonCanvasRef.current;
        if (!tempCanvas || !comparisonCanvas) return;

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

        tempCanvasContext.clearRect(0, 0, width, height);
        tempCanvasContext.drawImage(secondImage, 0, 0);
        const secondImageData = tempCanvasContext.getImageData(
          0,
          0,
          width,
          height
        ).data;

        worker.onmessage = (event) => {
          const { comparisonData, similarityPercentage, width, height } =
            event.data;

          const comparisonImageData = new ImageData(
            comparisonData,
            width,
            height
          );

          if (!comparisonCanvas) return;
          const comparisonCanvasContext = comparisonCanvas.getContext("2d");
          if (!comparisonCanvasContext) return;

          comparisonCanvas.width = width;
          comparisonCanvas.height = height;
          comparisonCanvasContext.putImageData(comparisonImageData, 0, 0);

          setComparisonImageUrl(comparisonCanvas.toDataURL());
          setSimilarityPercentage(similarityPercentage);
          worker.terminate();
        };

        worker.postMessage(
          {
            width,
            height,
            firstImageData,
            secondImageData,
            showSimilarities,
            showDifferences,
            showBaseImage,
          },
          [firstImageData.buffer, secondImageData.buffer]
        );
      } catch (error) {
        console.error("Error al procesar las imágenes:", error);
        worker.terminate();
      }
    };

    const worker = new ImageWorker();
    processImages();

    return () => {
      worker.terminate();
    };
  }, [image1Url, image2Url, showSimilarities, showDifferences, showBaseImage]);

  return {
    comparisonImageUrl,
    similarityPercentage,
    tempCanvasRef,
    comparisonCanvasRef,
  };
};
