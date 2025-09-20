// Define el tipo para la variable global self en el contexto del worker
declare const self: Worker;

interface ImageDataMessage {
  width: number;
  height: number;
  firstImageData: Uint8ClampedArray;
  secondImageData: Uint8ClampedArray;
  showSimilarities: boolean;
  showDifferences: boolean;
  showBaseImage: boolean;
}

self.onmessage = (event: MessageEvent<ImageDataMessage>) => {
  const {
    width,
    height,
    firstImageData,
    secondImageData,
    showSimilarities,
    showDifferences,
    showBaseImage,
  } = event.data;

  const comparisonData = new Uint8ClampedArray(width * height * 4);
  let matchCount = 0;
  const totalPixels = width * height;

  const similarityColor = [0, 255, 0]; // Verde
  const differenceColor = [255, 0, 0]; // Rojo
  const overlayAlpha = showBaseImage ? 128 : 255;

  for (let i = 0; i < firstImageData.length; i += 4) {
    const isMatch =
      firstImageData[i] === secondImageData[i] &&
      firstImageData[i + 1] === secondImageData[i + 1] &&
      firstImageData[i + 2] === secondImageData[i + 2] &&
      firstImageData[i + 3] === secondImageData[i + 3];

    if (isMatch) {
      matchCount++;
      if (showSimilarities) {
        comparisonData[i] = similarityColor[0];
        comparisonData[i + 1] = similarityColor[1];
        comparisonData[i + 2] = similarityColor[2];
        comparisonData[i + 3] = overlayAlpha;
      } else {
        comparisonData[i + 3] = 0;
      }
    } else {
      if (showDifferences) {
        comparisonData[i] = differenceColor[0];
        comparisonData[i + 1] = differenceColor[1];
        comparisonData[i + 2] = differenceColor[2];
        comparisonData[i + 3] = overlayAlpha;
      } else {
        comparisonData[i + 3] = 0;
      }
    }
  }

  const similarityPercentage = (matchCount / totalPixels) * 100;

  self.postMessage(
    {
      comparisonData,
      similarityPercentage,
      width,
      height,
    },
    [comparisonData.buffer]
  );
};

export {};
