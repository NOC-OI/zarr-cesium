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
      className={className}
      sx={{
        '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(234,234,234,.18)' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(212,149,17,.65)' },
        '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#d49511' },
        '& .MuiOutlinedInput-root': {
          color: 'white',
          backgroundColor: 'rgba(10,10,10,.45)',
          fontSize: '12px'
        }
      }}
      {...props}
    />
  );
}
