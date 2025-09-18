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
  children: ReactElement<{ style?: CSSProperties }>;
  scale: number;
  position: { x: number; y: number };
  onWheel: (e: WheelEvent<HTMLDivElement>) => void;
  onMouseDown: (e: MouseEvent<HTMLDivElement>) => void;
  isDragging: boolean;
}

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
