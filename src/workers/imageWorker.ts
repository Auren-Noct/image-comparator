// Define el tipo para la variable global self en el contexto del worker
declare const self: Worker;

// Usamos un tipo de utilidad para hacer el tipo de mensaje de salida más robusto.
type WorkerOutput = {
  comparisonData: Uint8ClampedArray;
  similarityPercentage: number;
  width: number;
  height: number;
};

interface ImageDataMessage {
  width: number;
  height: number;
  firstImageData: Uint8ClampedArray;
  secondImageData: Uint8ClampedArray;
  showSimilarities: boolean;
  showDifferences: boolean;
  showBaseImage: boolean;
}

/**
 * Worker para comparar dos imágenes y calcular su similitud/diferencia.
 * @param {MessageEvent<ImageDataMessage>} event - El evento del mensaje que contiene los datos de las imágenes.
 */
self.onmessage = (event: MessageEvent<ImageDataMessage>) => {
  try {
    const {
      width,
      height,
      firstImageData,
      secondImageData,
      showSimilarities,
      showDifferences,
      showBaseImage,
    } = event.data;

    // Uso de fail-fast programming para validar la entrada.
    if (
      !firstImageData ||
      !secondImageData ||
      firstImageData.length !== secondImageData.length
    ) {
      throw new Error(
        "Las imágenes no son válidas o no tienen el mismo tamaño."
      );
    }

    const comparisonData = new Uint8ClampedArray(width * height * 4);
    let matchCount = 0;

    const overlayAlpha = showBaseImage ? 128 : 255;
    const similarityColor = new Uint8ClampedArray([0, 255, 0, overlayAlpha]); // Verde con alfa
    const differenceColor = new Uint8ClampedArray([255, 0, 0, overlayAlpha]); // Rojo con alfa

    // Se separa la lógica de los datos en una función para mayor claridad.
    const getComparisonPixel = (isMatch: boolean): Uint8ClampedArray => {
      if (isMatch) {
        return showSimilarities
          ? similarityColor
          : new Uint8ClampedArray([0, 0, 0, 0]); // Píxel transparente
      } else {
        return showDifferences
          ? differenceColor
          : new Uint8ClampedArray([0, 0, 0, 0]); // Píxel transparente
      }
    };

    for (let i = 0; i < firstImageData.length; i += 4) {
      // Optimizamos la comparación de píxeles utilizando `every` en una sub-array para evitar comparaciones repetidas.
      const isMatch = [0, 1, 2, 3].every(
        (offset) => firstImageData[i + offset] === secondImageData[i + offset]
      );

      if (isMatch) {
        matchCount++;
      }

      // Se usa el spread operator para la inmutabilidad.
      const pixel = getComparisonPixel(isMatch);
      comparisonData.set(pixel, i);
    }

    const totalPixels = width * height;
    const similarityPercentage = (matchCount / totalPixels) * 100;

    const output: WorkerOutput = {
      comparisonData,
      similarityPercentage,
      width,
      height,
    };

    // Usamos transferrable objects para mayor eficiencia.
    self.postMessage(output, [comparisonData.buffer]);
  } catch (error) {
    console.error("Error en el worker de comparación de imágenes:", error);
    // En un entorno de producción, se podría reportar a Sentry.
    self.postMessage({ error: (error as Error).message });
  }
};

// Exportar un objeto vacío para cumplir con el formato de módulo.
export {};
