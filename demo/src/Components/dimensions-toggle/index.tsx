import { useLayersManagementHandle } from '../../application/use-layers';
import styles from './DimensionsToogle.module.css';

export function DimensionsToggle() {
  const { gebcoTerrainEnabled, setGebcoTerrainEnabled } = useLayersManagementHandle();

  function handleChangeDimensions() {
    setGebcoTerrainEnabled(!gebcoTerrainEnabled);
  }
  return (
    <div
      id="dimensions_toogle"
      className="text-[1rem] z-9998! font-extrabold leading-6 uppercase pl-0 sm:pl-3 pt-3 cursor-pointer"
    >
      <label className={`${styles.switch} relative cursor-pointer`}>
        <input type="checkbox" checked={gebcoTerrainEnabled} onChange={handleChangeDimensions} />
        <span className={`${styles.slider} ${styles.slider_animation}`}></span>
        <div className="absolute flex gap-3.5 -mt-6 text-[14px] pl-1.5 text-gray-200 font-changa">
          <div className={'text-white'}>2D</div>
          <div className={'text-white'}>3D</div>
        </div>
      </label>
    </div>
  );
}
