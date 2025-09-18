# Image Comparator

## 📝 Descripción del Proyecto

Esta es una **aplicación web** para **comparar dos imágenes** y resaltar las diferencias y similitudes entre ellas. La herramienta permite a los usuarios arrastrar y soltar imágenes, y luego visualizar una superposición que destaca los píxeles que no coinciden en **rojo** y los que sí coinciden en **verde**. Además, proporciona un porcentaje de similitud para cuantificar la comparación.

## ✨ Características Principales

- **Arrastrar y Soltar**: Interfaz intuitiva para cargar imágenes con zonas de _drag-and-drop_.
- **Comparación Visual**: Resalta automáticamente las diferencias (rojo) y similitudes (verde) en una imagen de superposición.
- **Estadísticas en Tiempo Real**: Muestra el porcentaje de similitud y diferencia entre las dos imágenes.
- **Controles de Visualización**: Opciones para ocultar/mostrar la imagen base, las similitudes o las diferencias.
- **Navegación Sincronizada**: Funcionalidad de **arrastre y zoom sincronizados** para navegar por ambas imágenes a la vez, facilitando la inspección detallada.
- **Intercambio de Imágenes**: Un botón dedicado para intercambiar rápidamente la posición de las dos imágenes.

---

## 🚀 Tecnologías Utilizadas

El proyecto está construido sobre una arquitectura moderna, utilizando las siguientes tecnologías:

- **React 19**: Un _framework_ de JavaScript para construir interfaces de usuario de manera declarativa. Se utilizan **hooks modernos** y la **programación funcional** para una gestión de estado y lógica eficientes.
- **TypeScript**: Lenguaje de programación que añade tipado estático a JavaScript, mejorando la robustez y el mantenimiento del código.
- **Tailwind CSS 4.1**: Un _framework_ de CSS de primera clase que agiliza el desarrollo de estilos con clases de utilidad directamente en el marcado, permitiendo un diseño responsivo y personalizable.
- **Vite**: Un _bundler_ de desarrollo rápido para construir la aplicación.
- **React Dropzone**: Una librería para simplificar la creación de zonas de arrastre de archivos.

---

## 📦 Instalación

Para poner en marcha el proyecto en tu entorno local, sigue estos pasos. Se recomienda usar **pnpm** como gestor de paquetes.

1. Clona el repositorio:
   `git clone https://github.com/Auren-Noct/image-comparator.git`

2. Navega al directorio del proyecto:
   `cd image-comparator`

3. Instala las dependencias:
   `pnpm install`

---

## 💻 Uso

### Modo de desarrollo

Para iniciar la aplicación en modo de desarrollo, ejecuta el siguiente comando. La aplicación estará disponible en `http://localhost:5173`.

```bash
pnpm run dev
```

### Construcción para producción

Para generar una versión optimizada de la aplicación para producción, ejecuta:

```bash
pnpm run build
```

---

## 👤 Autor

- **Nombre**: Walter Marcos Crespín
- **GitHub**: [Auren-Noct](https://github.com/Auren-Noct)
- **Correo electrónico**: <walter.crespin49@gmail.com>

---

## 📜 Licencia

Este proyecto está bajo la **Licencia MIT**. Puedes encontrar el texto completo de la licencia en el archivo `LICENSE`.
