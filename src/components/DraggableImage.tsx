import {
  type CSSProperties,
  type ReactElement,
  type WheelEvent,
  type MouseEvent,
  cloneElement,
} from "react";

/**
 * Propiedades para el componente DraggableImage.
 */
interface DraggableImageProps {
  /**
   * El elemento hijo que será arrastrado y escalado.
   */
  children: ReactElement<{ style?: CSSProperties }>;
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
  const imageStyle: CSSProperties = {
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
    cursor: isDragging ? "grabbing" : "grab",
    transition: "transform 0s",
  };

  return (
    <div
      className="w-full h-full overflow-hidden flex justify-center items-center"
      onMouseDown={onMouseDown}
      onWheel={onWheel}
    >
      {children &&
        cloneElement(children, {
          style: { ...children.props.style, ...imageStyle },
        })}
    </div>
  );
};

export default DraggableImage;
