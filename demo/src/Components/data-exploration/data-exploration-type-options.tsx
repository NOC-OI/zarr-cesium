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
  return (
    <div className="text-xs">
      <div
        id="type-option"
        className="flex justify-between items-center gap-1.5 font-bold text-white"
      >
        <CustomSwitch
          checked={verifyIfWasSelectedBefore(content, subLayer, selectedLayers)}
          onChange={(checked: boolean) =>
            handleChangeMapLayerAndAddLegend(
              checked,
              JSON.parse(
                JSON.stringify({
                  subLayer: `${content}_${subLayer}`,
                  dataInfo: subLayers[subLayer]
                })
              ),
              dispatch,
              subLayer,
              layerLegend,
              content,
              setOpacityIsClicked
            )
          }
          id={`${content}_${subLayer}`}
          label={subLayer}
        />
        {verifyIfWasSelectedBefore(content, subLayer, selectedLayers) ? (
          <div id="layer-edit" className="flex justify-between gap-1.5 font-bold">
            <InfoIcon
              id="info-subsection-button"
              onClick={() =>
                handleClickLayerInfo(content, subLayer, setInfoButtonBox, selectedLayers)
              }
              className="cursor-pointer hover:text-yellow-700"
              fontSize="small"
            />
            {['zarr-cesium', 'zarr-cube'].includes(selectedLayers[layerName].dataType) ? (
              <AreaChartIcon
                titleAccess="Query transect"
                onClick={() => setTransectLayerName(layerName)}
                className="cursor-pointer hover:text-yellow-700"
                fontSize="small"
              />
            ) : null}
            <TuneIcon
              onClick={() =>
                handleClickLegend(subLayers[subLayer], subLayer, dispatch, content, selectedLayers)
              }
              fontSize="small"
              className="cursor-pointer hover:text-yellow-700"
            />
            <OpacityIcon
              onClick={() => handleClickSlider(setOpacityIsClicked)}
              className="cursor-pointer hover:text-yellow-700"
              fontSize="small"
            />
          </div>
        ) : null}
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
