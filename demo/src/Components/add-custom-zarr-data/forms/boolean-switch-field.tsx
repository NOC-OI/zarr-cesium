import { Controller, type Control } from 'react-hook-form';
import Switch from '@mui/material/Switch';
import { FormRow } from '../../ui/form-row';

interface BooleanSwitchFieldProps {
  control: Control;
  name: string;
  label: string;
  enabledLabel?: string;
  disabledLabel?: string;
  error?: string;
}

export function BooleanSwitchField({
  control,
  name,
  label,
  enabledLabel = 'Enabled',
  disabledLabel = 'Disabled',
  error
}: BooleanSwitchFieldProps) {
  return (
    <FormRow label={label} error={error}>
      <Controller
        name={name}
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <div className="flex items-center gap-3">
            <Switch
              checked={!!field.value}
              onChange={(_, checked) => field.onChange(checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#d49511' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#d49511'
                },
                '& .MuiSwitch-track': {
                  border: '1px solid rgba(234,234,234,.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                },
                '& .MuiSwitch-thumb': {
                  border: '1px solid rgba(255,255,255,.45)'
                }
              }}
            />
            <span className="text-white text-sm">{field.value ? enabledLabel : disabledLabel}</span>
          </div>
        )}
      />
    </FormRow>
  );
}
