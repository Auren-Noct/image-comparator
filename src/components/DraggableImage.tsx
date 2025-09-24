import {
  memo,
  type CSSProperties,
  type ReactElement,
  type WheelEvent,
  type MouseEvent,
} from "react";

/**
 * Propiedades para el componente DraggableImage.
 */
interface DraggableImageProps {
  /**
   * El elemento hijo que será arrastrado y escalado.
   */
  children: ReactElement;
  /**
   * El factor de escala para el zoom.
   */
  scale: number;
  /**
   * La posición del elemento en coordenadas x e y.
   */
  position: { x: number; y: number };
  /**
   * Manejador del evento de rueda del ratón para el zoom.
   */
  onWheel: (e: WheelEvent<HTMLDivElement>) => void;
  /**
   * Manejador del evento de clic del ratón para iniciar el arrastre.
   */
  onMouseDown: (e: MouseEvent<HTMLDivElement>) => void;
  /**
   * Indica si el elemento se está arrastrando actualmente.
   */
  isDragging: boolean;
}

/**
 * Componente que permite arrastrar y hacer zoom sobre un elemento hijo.
 * @param props Las propiedades del componente.
 * @returns Un contenedor con el elemento hijo arrastrable y con zoom.
 */
const DraggableImage = ({
  children,
  scale,
  position,
  onWheel,
  onMouseDown,
  isDragging,
}: DraggableImageProps) => {
  // Estilo para el contenedor que se transforma (escala y arrastra)
  const transformStyle: CSSProperties = {
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
    transition: "transform 0s", // Evita transiciones bruscas al arrastrar
    width: "100%",
    height: "100%",
  };

  // Estilo para el contenedor que centra la imagen
  const wrapperStyle: CSSProperties = {
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div
      // Posicionamiento absoluto para aislarlo del layout
      className="absolute inset-0"
      onMouseDown={onMouseDown}
      onWheel={onWheel}
      style={wrapperStyle}
    >
      {/* Este div se transforma, y el hijo (la imagen) se ajusta a él */}
      <div style={transformStyle}>{children}</div>
    </div>
  );
};

export default memo(DraggableImage);
