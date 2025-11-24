import { useState } from 'react';
import { DataExplorationTypeOptions } from './data-exploration-type-options';
import type { DataExplorationTypeProps, LayerNamesType } from '../../types';
import LayersIcon from '@mui/icons-material/Layers';
export function DataExplorationType({
  content,
  childs,
  setInfoButtonBox
}: DataExplorationTypeProps) {
  const [subLayers, setSubLayers] = useState<LayerNamesType>({});

  const [isActive, setIsActive] = useState(false);

  function handleShowLayers() {
    setIsActive(isActive => !isActive);
    setSubLayers(subLayers => (Object.keys(subLayers).length === 0 ? childs : {}));
  }
  return (
    <div className="text-gray-900 border-radius-lg p-1.5 font-bold">
      <div>
        <header
          id="general-types"
          onClick={handleShowLayers}
          className="flex items-center justify-items-start text-sm pr-1 cursor-pointer hover:text-black"
          style={isActive ? { color: '#D49511' } : { color: 'white' }}
        >
          <span title="expand">
            <LayersIcon />
          </span>
          <p>{content}</p>
        </header>
      </div>
      <div className="flex flex-col gap-1 pt-1 text-gray-50">
        {Object.keys(subLayers).map(subLayer => {
          return (
            <DataExplorationTypeOptions
              key={`${content}_${subLayer}`}
              content={content}
              subLayer={subLayer}
              subLayers={subLayers}
              setInfoButtonBox={setInfoButtonBox}
            />
          );
        })}
      </div>
    </div>
  );
}
