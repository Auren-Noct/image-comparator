import { useEffect } from "react";

/**
 * Props para el componente Notification.
 * @interface NotificationProps
 */
interface NotificationProps {
  /** El mensaje que se mostrará en la notificación. */
  message: string;
  /** Función callback que se ejecuta al cerrar la notificación. */
  onClose: () => void;
}

/**
 * Un componente de UI para mostrar notificaciones (toasts) de forma temporal.
 * La notificación se cierra automáticamente después de 5 segundos o al hacer clic en el botón de cerrar.
 */
const Notification = ({ message, onClose }: NotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Se oculta automáticamente después de 5 segundos

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 bg-red-500 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in-down">
      <div className="flex justify-between items-center">
        <span className="text-sm">{message}</span>
        <button onClick={onClose} className="ml-4 text-white font-bold text-lg">
          &times;
        </button>
      </div>
    </div>
  );
};

export default Notification;
