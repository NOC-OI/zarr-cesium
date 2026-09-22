import { Controller, type Control } from 'react-hook-form';
import { FormRow } from '../../ui/form-row';

interface SelectFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  options: { label: string; value: string | number }[];
  error?: string;
  optional?: boolean;
}

export function SelectField({
  control,
  name,
  label,
  options,
  error,
  optional = true
}: SelectFieldProps) {
  return (
    <FormRow label={label} error={error}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <select
            className="form-select clickable"
            value={field.value ?? ''}
            onChange={event => {
              const value = event.target.value;
              field.onChange(
                value === '' ? undefined : /^\d+$/.test(value) ? Number(value) : value
              );
            }}
          >
            {optional ? <option value="">Auto detect</option> : null}
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      />
    </FormRow>
  );
}
