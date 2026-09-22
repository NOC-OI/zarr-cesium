import { useState } from 'react';
import { DataExplorationTypeOptions } from './data-exploration-type-options';
import type { DataExplorationTypeProps } from '../../types';
import LayersIcon from '@mui/icons-material/Layers';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
export function DataExplorationType({
  content,
  childs,
  setInfoButtonBox
}: DataExplorationTypeProps) {
  const [isActive, setIsActive] = useState(false);

  function handleShowLayers() {
    setIsActive(isActive => !isActive);
  }
  return (
    <section className="catalog-group">
      <div>
        <header id="general-types" onClick={handleShowLayers} className="catalog-group__header">
          <span className="catalog-group__icon">
            <LayersIcon fontSize="small" />
          </span>
          <span className="flex-1">{content.replace(/-/g, ' ')}</span>
          <ExpandMoreIcon
            className={`transition-transform ${isActive ? 'rotate-180' : ''}`}
            fontSize="small"
          />
        </header>
      </div>
      <div className="flex flex-col gap-2 pt-2 text-gray-50">
        {isActive &&
          Object.keys(childs).map(subLayer => {
            return (
              <DataExplorationTypeOptions
                key={`${content}_${subLayer}`}
                content={content}
                subLayer={subLayer}
                subLayers={childs}
                setInfoButtonBox={setInfoButtonBox}
              />
            );
          })}
      </div>
    </section>
  );
}
