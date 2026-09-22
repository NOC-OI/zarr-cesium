import { Controller, type Control } from 'react-hook-form';
import { FormRow } from '../../ui/form-row';

interface IndexRangeFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  error?: string;
}

export function IndexRangeField({ control, name, label, error }: IndexRangeFieldProps) {
  return (
    <FormRow label={label} error={error}>
      <Controller
        control={control}
        name={name}
        defaultValue={[0, 10]}
        render={({ field }) => {
          const value: [number, number] =
            Array.isArray(field.value) && field.value.length >= 2
              ? [Number(field.value[0]), Number(field.value[1])]
              : [0, 10];

          const updateValue = (index: 0 | 1, nextValue: string) => {
            const nextRange: [number, number] = [...value];
            nextRange[index] = Number(nextValue);
            field.onChange(nextRange);
          };

          return (
            <div className="grid min-w-0 w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5">
              <label className="flex min-w-0 flex-col gap-1">
                <span className="text-[8px] font-bold uppercase tracking-[.08em] text-[#888]">
                  From
                </span>
                <input
                  type="number"
                  min={0}
                  value={value[0]}
                  onChange={event => updateValue(0, event.target.value)}
                  className="form-select clickable box-border min-w-0 max-w-full px-2"
                  aria-label={`${label} start index`}
                />
              </label>
              <span className="mt-4 text-[10px] text-[#777]">to</span>
              <label className="flex min-w-0 flex-col gap-1">
                <span className="text-[8px] font-bold uppercase tracking-[.08em] text-[#888]">
                  To
                </span>
                <input
                  type="number"
                  min={0}
                  value={value[1]}
                  onChange={event => updateValue(1, event.target.value)}
                  className="form-select clickable box-border min-w-0 max-w-full px-2"
                  aria-label={`${label} end index`}
                />
              </label>
            </div>
          );
        }}
      />
    </FormRow>
  );
}
