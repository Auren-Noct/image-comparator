# Image Comparator

Una aplicación web para comparar dos imágenes y resaltar las diferencias entre ellas. Permite arrastrar y soltar imágenes, hacer zoom y moverlas sincronizadamente, y muestra el porcentaje de similitud entre ambas.

## Características

- **Arrastrar y soltar**: Sube dos imágenes fácilmente.
- **Zoom y movimiento sincronizado**: Haz zoom y mueve ambas imágenes al mismo tiempo para comparar detalles.
- **Comparación visual**: Genera una imagen resaltando las diferencias pixel a pixel.
- **Porcentaje de similitud**: Muestra el porcentaje de coincidencia entre las imágenes.
- **Intercambio rápido**: Botón para intercambiar las imágenes.

## Instalación

1. Clona el repositorio:
   ```sh
   git clone https://github.com/Auren-Noct/image-comparator.git
   cd image-comparator
   ```
2. Instala las dependencias:
   ```sh
   pnpm install
   ```
   o
   ```sh
   npm install
   ```

## Uso

- Inicia el servidor de desarrollo:
  ```sh
  pnpm dev
  ```
  o
  ```sh
  npm run dev
  ```
- Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## Scripts disponibles

- `dev`: Ejecuta la app en modo desarrollo.
- `build`: Compila el proyecto y genera la versión de producción.
- `preview`: Previsualiza la versión de producción.
- `lint`: Ejecuta ESLint para analizar el código.

## Estructura del proyecto

```
├── public/
│   └── vite.svg
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── components/
│       └── ImageComparator.tsx
├── index.html
├── package.json
├── README.md
└── ...
```

## Configuración de ESLint

El proyecto incluye reglas básicas de ESLint y soporte para React y TypeScript. Para reglas más estrictas y específicas de React, consulta la sección "Expanding the ESLint configuration" en este archivo.

## Tecnologías utilizadas

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Dropzone](https://react-dropzone.js.org/)

## Autor

Walter Marcos Crespín  
[GitHub](https://github.com/Auren-Noct)  
[Email](mailto:walter.crespin49@gmail.com)

## Licencia

Este proyecto está bajo la licencia MIT.
