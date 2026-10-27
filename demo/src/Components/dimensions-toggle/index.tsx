import { useAppDispatch, useAppSelector } from '../../application/use-layers';
import { layersActions } from '../../application/store';

export function DimensionsToggle() {
  const gebcoTerrainEnabled = useAppSelector(state => state.layers.gebcoTerrainEnabled);
  const dispatch = useAppDispatch();

  function handleChangeDimensions() {
    dispatch(layersActions.setGebcoTerrainEnabled(!gebcoTerrainEnabled));
  }
  return (
    <div id="dimensions_toggle" className="z-[9998] pl-2 pt-1 sm:pl-3">
      <label className="relative flex h-9 cursor-pointer items-center rounded-[10px] border border-white/18 bg-[rgba(17,17,17,0.88)] p-1 text-[10px] font-extrabold shadow-[0_8px_24px_rgba(0,0,0,.3)] backdrop-blur-xl">
        <input
          className="peer sr-only"
          type="checkbox"
          checked={gebcoTerrainEnabled}
          onChange={handleChangeDimensions}
        />
        <span className="absolute left-1 top-1 h-[26px] w-8 rounded-md bg-[#d49511] transition-transform duration-200 peer-checked:translate-x-8" />
        <span
          className={`relative z-10 grid h-[26px] w-8 place-items-center transition-colors ${gebcoTerrainEnabled ? 'text-[#b8b8b8]' : 'text-[#181818]'}`}
        >
          2D
        </span>
        <span
          className={`relative z-10 grid h-[26px] w-8 place-items-center transition-colors ${gebcoTerrainEnabled ? 'text-[#181818]' : 'text-[#b8b8b8]'}`}
        >
          3D
        </span>
      </label>
    </div>
  );
}
