import type { DataInfoType } from '../types';

interface LayerInfoPanelProps {
  layer: DataInfoType;
  layerId: string;
  group: string;
}

function formatName(value: string) {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\bv([23])\b/gi, 'Zarr v$1')
    .replace(/\b\w/g, character => character.toUpperCase());
}

export function LayerInfoPanel({ layer, layerId, group }: LayerInfoPanelProps) {
  return (
    <div className="layer-info">
      <div className="layer-info__intro">
        <span className="layer-info__eyebrow">{group}</span>
        <h2>{formatName(layerId)}</h2>
        <p>{layer.content}</p>
      </div>
    </div>
  );
}
