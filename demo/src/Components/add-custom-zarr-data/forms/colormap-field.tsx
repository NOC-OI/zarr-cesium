import { Controller, type Control } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { FormRow } from '../../ui/form-row';
import { allColorScales, DEFAULT_COLORMAP } from 'zarr-cesium';

interface ColormapFieldProps {
  control: Control<any>;
  name?: string;
  error?: string;
}

export function ColormapField({ control, name = 'params.colormap', error }: ColormapFieldProps) {
  return (
    <FormRow label="Colormap" error={error}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <FormControl fullWidth size="small">
            <Select
              {...field}
              value={field.value ?? DEFAULT_COLORMAP}
              className="text-white clickable"
              sx={{
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white'
                },
                '.MuiSvgIcon-root': { color: 'white' }
              }}
            >
              {allColorScales.map(c => (
                <MenuItem key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
    </FormRow>
  );
}
