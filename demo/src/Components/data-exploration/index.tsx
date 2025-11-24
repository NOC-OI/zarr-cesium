import type { DataExplorationSelectionProps } from '../../types';
import { DataExplorationType } from './data-exploration-type';

export function DataExplorationSelection({
  listLayers,
  display,
  setInfoButtonBox
}: DataExplorationSelectionProps) {
  if (!display) {
    return null;
  }
  return (
    <div className="rounded-2xl p-1.5  fadeIn-50-ease">
      <div className="m-h-[80vh] overflow-y-auto">
        {Object.keys(listLayers).map((layerClass: string) => (
          <DataExplorationType
            key={layerClass}
            content={layerClass}
            childs={listLayers[layerClass].layerNames}
            setInfoButtonBox={setInfoButtonBox}
          />
        ))}
      </div>
    </div>
  );
}
