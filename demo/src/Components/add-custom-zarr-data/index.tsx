import type { AddCustomZarrDataProps } from '../../types';
import { AddZarrForm } from './add-zarr-form';

export function AddCustomZarrData({ display }: AddCustomZarrDataProps) {
  if (!display) {
    return null;
  }
  return (
    <div className="rounded-2xl p-1.5  fadeIn-50-ease w-100">
      <div className="max-h-[70vh] overflow-y-auto">
        <AddZarrForm />
      </div>
    </div>
  );
}
