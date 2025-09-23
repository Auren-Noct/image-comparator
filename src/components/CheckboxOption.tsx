import { useTheme } from "../context/ThemeContext";
import { memo } from "react";

interface CheckboxOptionProps {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Componente reutilizable para una opción de checkbox con etiqueta.
 * @param {CheckboxOptionProps} props - Propiedades para el checkbox.
 * @returns Un elemento JSX con un checkbox y su etiqueta.
 */
const CheckboxOption = ({ label, checked, onChange }: CheckboxOptionProps) => {
  const { darkMode } = useTheme();

  return (
    <label
      className={`inline-flex items-center text-sm font-medium cursor-pointer ${
        darkMode ? "text-gray-200" : "text-gray-800"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="form-checkbox text-blue-700 rounded focus:ring-blue-600"
      />
      <span className="ml-2">{label}</span>
    </label>
  );
};

export default memo(CheckboxOption);
