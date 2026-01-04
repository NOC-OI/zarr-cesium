import { Controller, type Control } from 'react-hook-form';
import Switch from '@mui/material/Switch';
import { FormRow } from '../../ui/form-row';

interface BooleanSwitchFieldProps {
  control: Control<any>;
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
              color="success"
              sx={{
                '& .MuiSwitch-track': {
                  border: '1px solid white',
                  backgroundColor: field.value ? 'rgba(0, 255, 0, 0.4)' : 'rgba(255, 255, 255, 0.2)'
                },
                '& .MuiSwitch-thumb': {
                  border: '1px solid white',
                  backgroundColor: '#000'
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
