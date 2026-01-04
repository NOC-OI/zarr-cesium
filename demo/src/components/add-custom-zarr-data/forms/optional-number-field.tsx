import type { UseFormRegister } from 'react-hook-form';
import { FormRow } from '../../ui/form-row';
import { StyledTextField } from '../../ui/styled-text-field';

interface OptionalNumberFieldProps {
  register: UseFormRegister<any>;
  name: string;
  label: string;
  placeholder?: string;
  error?: string;
}

export function OptionalNumberField({
  register,
  name,
  label,
  placeholder,
  error
}: OptionalNumberFieldProps) {
  return (
    <FormRow label={label} error={error}>
      <StyledTextField
        type="number"
        placeholder={placeholder}
        {...register(name, {
          setValueAs: v => (v === '' || v === null || v === undefined ? undefined : Number(v))
        })}
      />
    </FormRow>
  );
}
