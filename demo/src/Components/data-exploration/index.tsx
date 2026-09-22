import { useAppSelector } from '../../application/use-layers';
import type { DataExplorationSelectionProps } from '../../types';
import { DataExplorationType } from './data-exploration-type';

export function DataExplorationSelection({
  display,
  setInfoButtonBox
}: DataExplorationSelectionProps) {
  const listLayers = useAppSelector(state => state.layers.listLayers);
  if (!display) {
    return null;
  }
  return (
    <div className="catalog-panel">
      <div className="catalog-panel__list">
        {Object.keys(listLayers).map((layerClass: string) => (
          <DataExplorationType
            key={layerClass}
            content={layerClass}
            childs={Object.fromEntries(
              Object.entries(listLayers[layerClass].layerNames).filter(([name, layer]) =>
                `${name} ${layer.dataDescription.join(' ')} ${layer.content}`.toLowerCase()
              )
            )}
            setInfoButtonBox={setInfoButtonBox}
          />
        ))}
      </div>
    </div>
  );
}
