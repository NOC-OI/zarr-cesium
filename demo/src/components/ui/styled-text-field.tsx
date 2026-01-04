// components/StyledTextField.tsx
import TextField from '@mui/material/TextField';
interface StyledTextFieldProps {
  label?: string;
  className?: string;
  [key: string]: any;
}

export function StyledTextField({ label, className = '', ...props }: StyledTextFieldProps) {
  return (
    <TextField
      label={label ? label : undefined}
      variant="outlined"
      size="small"
      fullWidth
      className={`bg-black bg-opacity-20 rounded-lg ${className}`}
      sx={{
        '.MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
        '& .MuiOutlinedInput-root': {
          color: 'white'
        }
      }}
      {...props}
    />
  );
}
