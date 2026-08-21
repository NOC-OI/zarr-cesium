
interface CustomSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
  label?: string;
  disabled?: boolean;
}

export const CustomSwitch = ({ checked, onChange, id, label, disabled }: CustomSwitchProps) => {
  return (
        <label
          key={id}
          htmlFor={id}
          className="opacity-70 hover:opacity-100 flex items-center pr-3 whitespace-nowrap p-2 cursor-pointer"
        >
          <input
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
            className="chk"
            type="checkbox"
            checked={checked}
            id={id}
            disabled={disabled}
          />
          <label htmlFor={id} className="switch">
            <span className="slider"></span>
          </label>
          {label && <p className="align-middle pl-1 text-xs">{label}</p>}
        </label>
  );
}
