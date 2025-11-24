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
import { useLayersManagementHandle } from '../../application/use-layers';
import type { DataExplorationTypeOptionsProps } from '../../types';
import InfoIcon from '@mui/icons-material/Info';
import TuneIcon from '@mui/icons-material/Tune';
import OpacityIcon from '@mui/icons-material/Opacity';
export function DataExplorationTypeOptions({
  content,
  subLayer,
  subLayers,
  setInfoButtonBox
}: DataExplorationTypeOptionsProps) {
  const {
    setActualLayer,
    setLayerAction,
    selectedLayers,
    setSelectedLayers,
    layerLegend,
    setLayerLegend
  } = useLayersManagementHandle();
  const [opacityIsClicked, setOpacityIsClicked] = useState(false);
  return (
    <div className="text-xs">
      <div
        id="type-option"
        className="flex justify-between items-center gap-1.5 font-bold text-white"
      >
        <label
          key={`${content}_${subLayer}`}
          htmlFor={`${content}_${subLayer}`}
          className="opacity-70 hover:opacity-100 flex items-center pr-3 whitespace-nowrap p-2 cursor-pointer"
        >
          <input
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChangeMapLayerAndAddLegend(
                e,
                setActualLayer,
                setOpacityIsClicked,
                setLayerAction,
                setSelectedLayers,
                subLayer,
                setLayerLegend,
                layerLegend,
                content
              )
            }
            value={JSON.stringify({
              subLayer: `${content}_${subLayer}`,
              dataInfo: subLayers[subLayer]
            })}
            className="chk"
            type="checkbox"
            checked={verifyIfWasSelectedBefore(content, subLayer, selectedLayers)}
            id={`${content}_${subLayer}`}
          />
          <label htmlFor={`${content}_${subLayer}`} className="switch">
            <span className="slider"></span>
          </label>
          <p className="align-middle pl-1 text-xs">{subLayer}</p>
        </label>
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
            <TuneIcon
              onClick={() =>
                handleClickLegend(
                  subLayers[subLayer],
                  subLayer,
                  setLayerLegend,
                  content,
                  selectedLayers
                )
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
            handleChangeOpacity(
              e,
              setLayerAction,
              setSelectedLayers,
              content,
              subLayer,
              subLayers,
              setActualLayer
            )
          }
        />
      )}
    </div>
  );
}
