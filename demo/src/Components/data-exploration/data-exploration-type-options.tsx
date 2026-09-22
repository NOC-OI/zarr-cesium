import { useState } from 'react';
import {
  getPreviousOpacityValue,
  handleChangeMapLayerAndAddLegend,
  handleChangeOpacity,
  handleClickLayerInfo,
  handleClickLegend,
  handleClickSlider,
  verifyIfWasSelectedBefore
} from './_actions/actions';
import { useAppDispatch, useAppSelector } from '../../application/use-layers';
import type { DataExplorationTypeOptionsProps } from '../../types';
import InfoIcon from '@mui/icons-material/Info';
import TuneIcon from '@mui/icons-material/Tune';
import OpacityIcon from '@mui/icons-material/Opacity';
import AreaChartIcon from '@mui/icons-material/AreaChart';
import { useContextHandle } from '../../application/use-context';
import { CustomSwitch } from '../ui/custom-switch';
export function DataExplorationTypeOptions({
  content,
  subLayer,
  subLayers,
  setInfoButtonBox
}: DataExplorationTypeOptionsProps) {
  const { selectedLayers, layerLegend } = useAppSelector(state => state.layers);
  const dispatch = useAppDispatch();
  const [opacityIsClicked, setOpacityIsClicked] = useState(false);
  const { setTransectLayerName } = useContextHandle();
  const layerName = `${content}_${subLayer}`;
  const layer = subLayers[subLayer];
  const displayName = layer.dataDescription[0];
  return (
    <div className={`layer-card relative ${selectedLayers[layerName] ? 'layer-card--active' : ''}`}>
      <div id="type-option" className="text-white">
        <div className={`min-w-0 ${selectedLayers[layerName] ? 'pr-29' : 'pr-8'}`}>
          <CustomSwitch
            checked={verifyIfWasSelectedBefore(content, subLayer, selectedLayers)}
            onChange={(checked: boolean) =>
              handleChangeMapLayerAndAddLegend(
                checked,
                JSON.parse(JSON.stringify({ subLayer: layerName, dataInfo: layer })),
                dispatch,
                subLayer,
                layerLegend,
                content,
                setOpacityIsClicked
              )
            }
            id={layerName}
            label={displayName}
          />
          <div className="layer-card__meta">
            {layer.tags?.map((tag: string) => (
              <span key={tag} className="tag">
                {tag.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
        <div
          id="layer-edit"
          className="layer-card__actions layer-option-actions absolute right-2.5 top-1/2 -translate-y-1/2"
        >
          <button
            type="button"
            title="View layer details"
            aria-label={`View details for ${displayName}`}
            onClick={() => handleClickLayerInfo(content, subLayer, setInfoButtonBox, layer)}
          >
            <InfoIcon fontSize="small" />
          </button>
          {verifyIfWasSelectedBefore(content, subLayer, selectedLayers) ? (
            <>
              {['zarr-cesium', 'zarr-cube'].includes(selectedLayers[layerName].dataType) ? (
                <button
                  type="button"
                  title="Query a transect"
                  onClick={() => setTransectLayerName(layerName)}
                >
                  <AreaChartIcon titleAccess="Query transect" fontSize="small" />
                </button>
              ) : null}
              <button
                type="button"
                title="Style layer"
                onClick={() =>
                  handleClickLegend(
                    subLayers[subLayer],
                    subLayer,
                    dispatch,
                    content,
                    selectedLayers
                  )
                }
              >
                <TuneIcon fontSize="small" />
              </button>
              <button
                type="button"
                title="Change opacity"
                onClick={() => handleClickSlider(setOpacityIsClicked)}
              >
                <OpacityIcon fontSize="small" />
              </button>
            </>
          ) : null}
        </div>
      </div>
      {opacityIsClicked && verifyIfWasSelectedBefore(content, subLayer, selectedLayers) && (
        <input
          className="focus:shadow-none outline-none w-full accent-yellow-700"
          type="range"
          step={0.1}
          min={0}
          max={1}
          value={getPreviousOpacityValue(`${content}_${subLayer}`, selectedLayers)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleChangeOpacity(e, dispatch, content, subLayer, subLayers, selectedLayers)
          }
        />
      )}
    </div>
  );
}
