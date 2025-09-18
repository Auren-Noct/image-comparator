import React from "react";

/**
 * Propiedades para el componente DraggableImage.
 */
interface DraggableImageProps {
  children: React.ReactElement<{ style?: React.CSSProperties }>;
  scale: number;
  position: { x: number; y: number };
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  isDragging: boolean;
}

/**
 * Componente reutilizable para manejar la lógica de arrastrar y hacer zoom.
 */
const DraggableImage = ({
  children,
  scale,
  position,
  onWheel,
  onMouseDown,
  isDragging,
}: DraggableImageProps) => {
  const imageStyle: React.CSSProperties = {
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
        React.cloneElement(children, {
          style: { ...children.props.style, ...imageStyle },
        })}
    </div>
  );
};

export default DraggableImage;
