'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { CesiumType } from '../types/cesium';
import { type Viewer } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { ZarrCubeComponent } from '@/lib/zarr-cube-component';
import { ZarrCubeVelocityComponent } from '@/lib/zarr-cube-velocity-component';
import { ZarrLayerComponent } from '@/lib/zarr-layer-component';

export const CesiumComponent: React.FunctionComponent<{
  CesiumJs: CesiumType;
}> = ({ CesiumJs }) => {
  const viewerRef = useRef<Viewer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [show3D, setShow3D] = useState(false);
  const [show2D, setShow2D] = useState(false);
  const [showCurrents, setShowCurrents] = useState(false);
  const [belowSeaLevel, setBelowSeaLevel] = useState(false);
  const [gebcoTerrainEnabled, setGebcoTerrainEnabled] = useState(false);
  const verticalExaggeration = 50.0;
  useEffect(() => {
    if (!containerRef.current) return;

    CesiumJs.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN || '';

    const viewer = new CesiumJs.Viewer(containerRef.current, {
      baseLayerPicker: false,
      timeline: false,
      animation: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false
    });
    if (gebcoTerrainEnabled) {
      viewer.scene.setTerrain(
        new CesiumJs.Terrain(CesiumJs.CesiumTerrainProvider.fromIonAssetId(2426648))
      );
      setBelowSeaLevel(true);
      viewer.scene.verticalExaggerationRelativeHeight = 0.0; // exaggerate around sea level
      viewer.scene.verticalExaggeration = verticalExaggeration;
    }
    viewerRef.current = viewer;

    return () => {
      viewer.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleGebcoTerrain = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (gebcoTerrainEnabled) {
      viewer.scene.terrainProvider = new CesiumJs.EllipsoidTerrainProvider();
      setGebcoTerrainEnabled(false);
      setBelowSeaLevel(false);
      setShow3D(false);
      setShowCurrents(false);
      viewer.scene.verticalExaggeration = 1.0;
    } else {
      viewer.scene.setTerrain(
        new CesiumJs.Terrain(CesiumJs.CesiumTerrainProvider.fromIonAssetId(2426648))
      );
      setGebcoTerrainEnabled(true);
      setBelowSeaLevel(true);
      setShow3D(false);
      setShowCurrents(false);
      viewer.scene.verticalExaggerationRelativeHeight = 0.0; // exaggerate around sea level
      viewer.scene.verticalExaggeration = verticalExaggeration;
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {showCurrents && (
        <ZarrCubeVelocityComponent
          viewerRef={viewerRef}
          uUrl="https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/nemotest101/currents/uo.zarr"
          vUrl="https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/nemotest101/currents/vo.zarr"
          bounds={{ west: -40, south: -10, east: -20, north: 10 }}
          maxElevation={30}
          belowSeaLevel={belowSeaLevel}
        />
      )}
      {show2D && (
        <ZarrLayerComponent
          viewerRef={viewerRef}
          url="https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/nemotest101/pyramid2/T1d/sos_abs.zarr"
          variable="sos_abs"
        />
      )}
      {show3D && (
        <ZarrCubeComponent
          viewerRef={viewerRef}
          url="https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/nemotest101/currents/uo.zarr"
          variable="uo"
          bounds={{ west: -40, south: -10, east: -20, north: 10 }}
          belowSeaLevel={belowSeaLevel}
          flipElevation={true}
          maxElevation={30}
        />
        // <ZarrCubeComponent
        //   viewerRef={viewerRef}
        //   url="https://storage.googleapis.com/weatherbench2/datasets/era5/1959-2023_01_10-full_37-1h-0p25deg-chunk-1.zarr"
        //   variable="temperature"
        //   bounds={{ west: -40, south: -10, east: -20, north: 10 }}
        //   maxElevation={30}
        //   dimensionNames={{ elevation: 'level', time: 'time' }}
        //   showHorizontalSlices={true}
        //   belowSeaLevel={belowSeaLevel}
        //   showVerticalSlices={true}
        //   selectors={{
        //     time: {
        //       selected: 0,
        //       type: 'index'
        //     }
        //   }}
        // />
      )}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          cursor: 'pointer',
          border: '1px solid #ccc'
        }}
      >
        <button
          style={{
            marginRight: 10,
            background: 'white',
            padding: '8px 14px',
            borderRadius: 4,
            cursor: 'pointer',
            border: '1px solid #ccc'
          }}
          onClick={toggleGebcoTerrain}
        >
          {gebcoTerrainEnabled ? 'Remove Gebco Terrain' : 'Add Gebco Terrain'}
        </button>
        <button
          style={{
            marginRight: 10,
            background: 'white',
            padding: '8px 14px',
            borderRadius: 4,
            cursor: 'pointer',
            border: '1px solid #ccc'
          }}
          onClick={() => setShow2D(prev => !prev)}
        >
          {show2D ? 'Hide 2D Map' : 'Show 2D Map'}
        </button>
        <button
          style={{
            marginRight: 10,
            background: 'white',
            padding: '8px 14px',
            borderRadius: 4,
            cursor: 'pointer',
            border: '1px solid #ccc'
          }}
          onClick={() => setShow3D(prev => !prev)}
        >
          {show3D ? 'Hide 3D Volume' : 'Show 3D Volume'}
        </button>
        <button
          style={{
            background: 'white',
            padding: '8px 14px',
            borderRadius: 4,
            cursor: 'pointer',
            border: '1px solid #ccc'
          }}
          onClick={() => setShowCurrents(prev => !prev)}
        >
          {showCurrents ? 'Hide Currents Layer' : 'Show Currents Layer'}
        </button>
      </div>
    </div>
  );
};

export default CesiumComponent;

// const url = 'https://atlantis-vis-o.s3-ext.jc.rl.ac.uk/nemotest101/currents/uo.zarr';
// const provider = new ZarLayerProvider({
//   url,
//   variable: 'uo',
//   scale: [-1, 1],
//   colormap: 'jet',
//   tileWidth: 256,
//   tileHeight: 256,
//   minimumLevel: 0,
//   maximumLevel: 8,
// });
// const url = 'https://carbonplan-maps.s3.us-west-2.amazonaws.com/v2/demo/4d/tavg-prec-month';
// const provider = new ZarLayerProvider({
//   url,
//   variable: 'climate',
//   scale: [-20, 30],
//   colormap: 'hot',
//   tileWidth: 256,
//   tileHeight: 256,
//   minimumLevel: 0,
//   maximumLevel: 8,
//   selectors: {
//     month: {
//       selected: 0,
//       type: "index"
//     },
//     band: {
//       selected: 0,
//       type: "index"
//     }
//   }
// });
// const url = 'https://carbonplan-maps.s3.us-west-2.amazonaws.com/v2/demo/4d/tavg-prec-month';
// const provider = new ZarLayerProvider({
//   url,
//   variable: 'climate',
//   scale: [-20, 30],
//   colormap: 'hot',
//   tileWidth: 256,
//   tileHeight: 256,
//   minimumLevel: 0,
//   maximumLevel: 8,
//   selectors: {
//     month: {
//       selected: 1,
//       type: "value"
//     },
//     band: {
//       selected: "tavg",
//       type: "value"
//     }
//   }
// });
