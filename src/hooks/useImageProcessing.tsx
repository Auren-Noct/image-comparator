import { useEffect, useRef, useState } from "react";

/**
 * Hook personalizado para manejar la lógica de procesamiento de imágenes.
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

  useEffect(() => {
    if (image1Url && image2Url) {
      const firstImage = new Image();
      const secondImage = new Image();

      firstImage.crossOrigin = "anonymous";
      secondImage.crossOrigin = "anonymous";

      firstImage.onload = () => {
        secondImage.onload = () => {
          const width = Math.max(firstImage.width, secondImage.width);
          const height = Math.max(firstImage.height, secondImage.height);

          const tempCanvas = tempCanvasRef.current;
          const comparisonCanvas = comparisonCanvasRef.current;
          if (!tempCanvas || !comparisonCanvas) return;

          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCanvasContext = tempCanvas.getContext("2d");
          if (!tempCanvasContext) return;

          // Dibuja la primera imagen en el canvas temporal
          tempCanvasContext.clearRect(0, 0, width, height);
          tempCanvasContext.drawImage(firstImage, 0, 0);
          const firstImageData = tempCanvasContext.getImageData(
            0,
            0,
            width,
            height
          ).data;

          // Dibuja la segunda imagen en el canvas temporal
          tempCanvasContext.clearRect(0, 0, width, height);
          tempCanvasContext.drawImage(secondImage, 0, 0);
          const secondImageData = tempCanvasContext.getImageData(
            0,
            0,
            width,
            height
          ).data;

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
          const overlayAlpha = showBaseImage ? 128 : 255;

          for (let i = 0; i < firstImageData.length; i += 4) {
            const firstImageRed = firstImageData[i];
            const firstImageGreen = firstImageData[i + 1];
            const firstImageBlue = firstImageData[i + 2];
            const firstImageAlpha = firstImageData[i + 3];

            const secondImageRed = secondImageData[i];
            const secondImageGreen = secondImageData[i + 1];
            const secondImageBlue = secondImageData[i + 2];
            const secondImageAlpha = secondImageData[i + 3];

            const isMatch =
              firstImageRed === secondImageRed &&
              firstImageGreen === secondImageGreen &&
              firstImageBlue === secondImageBlue &&
              firstImageAlpha === secondImageAlpha;

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

          comparisonCanvasContext.putImageData(comparisonData, 0, 0);

          setSimilarityPercentage((matchCount / totalPixels) * 100);
          setComparisonImageUrl(comparisonCanvas.toDataURL());
        };
        secondImage.src = image2Url;
      };
      firstImage.src = image1Url;
    }
  }, [image1Url, image2Url, showSimilarities, showDifferences, showBaseImage]);

  return {
    comparisonImageUrl,
    similarityPercentage,
    tempCanvasRef,
    comparisonCanvasRef,
  };
};
