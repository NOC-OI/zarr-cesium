import type { AddCustomZarrDataProps } from '../../types';
import { AddZarrForm } from './add-zarr-form';

export function AddCustomZarrData({ display }: AddCustomZarrDataProps) {
  if (!display) {
    return null;
  }
  return (
    <div className="bg-[rgba(17,17,17,.35)]">
      <div className="max-h-[calc(100vh-190px)] overflow-y-auto p-3 [scrollbar-color:#555_transparent] scrollbar-thin max-sm:max-h-[calc(58vh-160px)]">
        <AddZarrForm />
      </div>
    </div>
  );
}
