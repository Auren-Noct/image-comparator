import { useEffect, useRef, useState } from "react";
import ImageWorker from "../workers/imageWorker?worker";
type ImageWorkerType = Worker;

interface ImageProcessingResult {
  comparisonImageUrl: string | null;
  similarityPercentage: number | null;
  isProcessing: boolean;
  tempCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  comparisonCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

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

/**
 * Hook personalizado para manejar la lógica de procesamiento de imágenes
 * de forma asíncrona usando un Web Worker.
 *
 * @param image1Url La URL de la primera imagen.
 * @param image2Url La URL de la segunda imagen.
 * @param showSimilarities Muestra los píxeles similares en verde.
 * @param showDifferences Muestra los píxeles diferentes en rojo.
 * @param showBaseImage Mantiene la imagen base debajo de la superposición.
 * @returns {ImageProcessingResult} Un objeto con la URL de la imagen de comparación,
 * el porcentaje de similitud y las referencias a los canvas.
 */
export const useImageProcessing = (
  image1Url: string | null,
  image2Url: string | null,
  showSimilarities: boolean,
  showDifferences: boolean,
  showBaseImage: boolean
): ImageProcessingResult => {
  const [comparisonImageUrl, setComparisonImageUrl] = useState<string | null>(
    null
  );
  const [similarityPercentage, setSimilarityPercentage] = useState<
    number | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const comparisonCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Almacenar los datos de imagen en el estado para evitar recalculos en el worker
  const [imageData, setImageData] = useState<{
    firstImageData: Uint8ClampedArray | null;
    secondImageData: Uint8ClampedArray | null;
    width: number;
    height: number;
  }>({
    firstImageData: null,
    secondImageData: null,
    width: 0,
    height: 0,
  });

  // Mantener la referencia al worker para su uso persistente
  const workerRef = useRef<ImageWorkerType | null>(null);

  /**
   * Primer useEffect: Carga las imágenes y obtiene los datos de los píxeles.
   * Se ejecuta solo cuando cambian las URLs.
   */
  useEffect(() => {
    // Si no hay URLs, limpiar el estado
    if (!image1Url || !image2Url) {
      setImageData({
        firstImageData: null,
        secondImageData: null,
        width: 0,
        height: 0,
      });
      setComparisonImageUrl(null);
      setSimilarityPercentage(null);
      setIsProcessing(false);
      return;
    }

    const loadAndProcessImages = async () => {
      const tempCanvas = tempCanvasRef.current;
      if (!tempCanvas) {
        return;
      }

      setIsProcessing(true);
      try {
        const [firstImage, secondImage] = await Promise.all([
          loadImage(image1Url),
          loadImage(image2Url),
        ]);

        const width = Math.max(firstImage.width, secondImage.width);
        const height = Math.max(firstImage.height, secondImage.height);

        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCanvasContext = tempCanvas.getContext("2d");
        if (!tempCanvasContext) return;

        // Obtener los datos de la primera imagen
        tempCanvasContext.drawImage(firstImage, 0, 0);
        const firstImageData = tempCanvasContext.getImageData(
          0,
          0,
          width,
          height
        ).data;

        // Limpiar y obtener los datos de la segunda imagen
        tempCanvasContext.clearRect(0, 0, width, height);
        tempCanvasContext.drawImage(secondImage, 0, 0);
        const secondImageData = tempCanvasContext.getImageData(
          0,
          0,
          width,
          height
        ).data;

        // Almacenar los datos en el estado para el segundo useEffect
        setImageData({ firstImageData, secondImageData, width, height });
      } catch (error) {
        console.error("Error al cargar las imágenes:", error);
        setIsProcessing(false);
      }
    };

    void loadAndProcessImages();
  }, [image1Url, image2Url]);

  /**
   * Segundo useEffect: Envía los datos al worker y maneja la respuesta.
   * Se ejecuta cuando cambian los datos de las imágenes o las opciones de visualización.
   */
  useEffect(() => {
    const { firstImageData, secondImageData, width, height } = imageData;

    // No hay datos para procesar
    if (!firstImageData || !secondImageData) {
      setIsProcessing(false);
      return;
    }

    // Asegurarse de que el worker esté inicializado
    if (!workerRef.current) {
      workerRef.current = new ImageWorker();
      workerRef.current.onmessage = (event: MessageEvent) => {
        const { comparisonData, similarityPercentage, width, height } =
          event.data;
        const comparisonCanvas = comparisonCanvasRef.current;

        if (!comparisonCanvas) return;

        const comparisonImageData = new ImageData(
          comparisonData,
          width,
          height
        );
        const comparisonCanvasContext = comparisonCanvas.getContext("2d");
        if (!comparisonCanvasContext) return;

        comparisonCanvas.width = width;
        comparisonCanvas.height = height;
        comparisonCanvasContext.putImageData(comparisonImageData, 0, 0);

        setComparisonImageUrl(comparisonCanvas.toDataURL());
        setSimilarityPercentage(similarityPercentage);
        setIsProcessing(false);
      };
    }

    // Enviar el mensaje al worker con las opciones de visualización
    workerRef.current.postMessage(
      {
        width,
        height,
        firstImageData,
        secondImageData,
        showSimilarities,
        showDifferences,
        showBaseImage,
      },
      // Usar transferrable objects para mayor rendimiento
      [firstImageData.buffer.slice(0), secondImageData.buffer.slice(0)]
    );
  }, [imageData, showSimilarities, showDifferences, showBaseImage]);

  // Limpiar el worker cuando el componente se desmonte
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  return {
    comparisonImageUrl,
    similarityPercentage,
    isProcessing,
    tempCanvasRef,
    comparisonCanvasRef,
  };
};
