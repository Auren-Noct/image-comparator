import {
  createContext,
  useState,
  useCallback,
  useContext,
  type ReactNode,
  useMemo,
} from "react";
import Notification from "../components/Notification";

/**
 * Define la forma del contexto de notificaciones.
 * @interface NotificationContextType
 */
interface NotificationContextType {
  /**
   * Muestra una notificación en la pantalla.
   * @param message El mensaje a mostrar.
   */
  showNotification: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);
/**
 * Hook personalizado para acceder al contexto de notificaciones.
 * Proporciona una función para mostrar notificaciones desde cualquier componente.
 *
 * @returns {NotificationContextType} El objeto del contexto de notificaciones.
 * @throws {Error} Si se usa fuera de un `NotificationProvider`.
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  // Fail-fast: Asegura que el hook se use dentro del proveedor correcto.
  if (!context) {
    throw new Error(
      "useNotification debe ser usado dentro de un NotificationProvider"
    );
  }
  return context;
};

/**
 * Proveedor que gestiona el estado y la renderización de las notificaciones.
 *
 * @param {object} props - Las props del componente.
 * @param {ReactNode} props.children - Los componentes hijos que tendrán acceso al contexto.
 */
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [message, setMessage] = useState<string | null>(null);

  const showNotification = useCallback((msg: string) => {
    setMessage(msg);
    // La notificación se oculta automáticamente desde el componente Notification
  }, []);

  const handleClose = useCallback(() => {
    setMessage(null);
  }, []);

  const value = useMemo(() => ({ showNotification }), [showNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {message && <Notification message={message} onClose={handleClose} />}
    </NotificationContext.Provider>
  );
};
