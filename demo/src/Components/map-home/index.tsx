import { Ion, type Viewer } from 'cesium';
import { useEffect, useRef, useCallback } from 'react';
import * as Cesium from 'cesium';
import { useContextHandle } from '../../application/use-context';
import type { keyable } from '../../types';
import { useAppDispatch, useAppSelector } from '../../application/use-layers';
import { layersActions } from '../../application/store';
import { generateSelectedLayer, viewerMap } from './_actions/get-layers';
import {
  changeMapBounds,
  changeMapColors,
  changeMapCubeParams,
  changeMapCubeSlices,
  changeMapDimensions,
  changeMapOpacity,
  changeMapPyramidLevels,
  changeMapVelocitySlices,
  removeLayerFromMap,
  updateSeaLevelLayerReference
} from './_actions/layers-handle';
import type { ZarrCubeProvider, ZarrCubeVelocityProvider } from 'zarr-cesium';
import { CESIUM_START_COORDINATES, VERTICAL_EXAGGERATION } from '../../lib/map-layers/utils';

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;

export function MapHome() {
  const { selectedLayers, actualLayer, layerAction, gebcoTerrainEnabled, listLayers } =
    useAppSelector(state => state.layers);
  const dispatch = useAppDispatch();
  const viewerRef = useRef<Viewer | null>(null);
  const velocityCubeRef = useRef<ZarrCubeVelocityProvider | null>(null);
  const cubeRef = useRef<ZarrCubeProvider | null>(null);
  const velocityRef = useRef<ZarrCubeVelocityProvider | null>(null);
  const sharedLayersRef = useRef(selectedLayers);
  const sharedLayersRestoredRef = useRef(false);

  const { setFlashMessage, setLoading } = useContextHandle();
  Cesium.Camera.DEFAULT_VIEW_RECTANGLE = CESIUM_START_COORDINATES;

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      if (node !== null) {
        viewerRef.current = new Cesium.Viewer(node, {
          baseLayerPicker: false,
          timeline: false,
          animation: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          baseLayer: Cesium.ImageryLayer.fromProviderAsync(
            Cesium.ArcGisMapServerImageryProvider.fromUrl(
              'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
              {}
            )
          )
        });
        if (!sharedLayersRestoredRef.current) {
          sharedLayersRestoredRef.current = true;
          const sharedLayers = sharedLayersRef.current;
          void (async () => {
            for (const layerName of Object.keys(sharedLayers).reverse()) {
              const layers = viewerMap(viewerRef, sharedLayers[layerName].dataType) || null;
              const result = await generateSelectedLayer(
                layerName,
                sharedLayers,
                viewerRef as React.RefObject<Viewer>,
                layers,
                { velocityRef, cubeRef, velocityCubeRef },
                gebcoTerrainEnabled
              );
              if (result?.selectedLayer) {
                dispatch(
                  layersActions.updateSelectedLayer({
                    name: layerName,
                    layer: result.selectedLayer
                  })
                );
              }
              if (result?.error) {
                setFlashMessage({ messageType: 'error', content: result.error });
              }
            }
            setLoading(false);
          })();
        } else {
          setLoading(false);
        }
      }
    },
    [dispatch, gebcoTerrainEnabled, setFlashMessage, setLoading]
  );

  async function addLayerIntoMap() {
    if (!viewerRef.current) return;
    const layers = viewerMap(viewerRef, selectedLayers[actualLayer].dataType) || null;
    const result = await generateSelectedLayer(
      actualLayer,
      selectedLayers,
      viewerRef as React.RefObject<Viewer>,
      layers,
      {
        velocityRef,
        cubeRef,
        velocityCubeRef
      },
      gebcoTerrainEnabled
    );
    if (result?.selectedLayer) {
      dispatch(
        layersActions.updateSelectedLayer({ name: actualLayer, layer: result.selectedLayer })
      );
    }
    if (result?.error) {
      setFlashMessage({
        messageType: 'error',
        content: result.error
      });
    }
    dispatch(layersActions.setLayerAction(''));
    setLoading(false);
  }

  async function handleLayerAction(actionMap: keyable, action: string) {
    setLoading(true);
    const selectedLayer = await actionMap[action].function(...actionMap[action].args);
    if (selectedLayer) {
      dispatch(layersActions.updateSelectedLayer({ name: actualLayer, layer: selectedLayer }));
    }
    setLoading(false);
    dispatch(layersActions.setLayerAction(''));
  }

  useEffect(() => {
    if (!viewerRef.current) return;
    if (gebcoTerrainEnabled) {
      viewerRef.current.scene.setTerrain(
        new Cesium.Terrain(Cesium.CesiumTerrainProvider.fromIonAssetId(2426648))
      );
      viewerRef.current.scene.verticalExaggerationRelativeHeight = 0.0;
      viewerRef.current.scene.verticalExaggeration = VERTICAL_EXAGGERATION;
    } else {
      viewerRef.current.scene.terrainProvider = new Cesium.EllipsoidTerrainProvider();
      viewerRef.current.scene.verticalExaggerationRelativeHeight = 0.0;
      viewerRef.current.scene.verticalExaggeration = 1.0;
    }
    const updatedLayers = updateSeaLevelLayerReference(
      cubeRef,
      velocityCubeRef,
      gebcoTerrainEnabled,
      selectedLayers
    );
    updatedLayers.forEach(update => {
      if (update.layer)
        dispatch(layersActions.updateSelectedLayer({ name: update.name, layer: update.layer }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gebcoTerrainEnabled]);

  useEffect(() => {
    if (!viewerRef.current) return;
    const zarrCesiumRefs = {
      velocityRef,
      cubeRef,
      velocityCubeRef
    };
    const actionMap: Record<string, { function: any; args: any[] }> = {
      remove: {
        function: removeLayerFromMap,
        args: [actualLayer, listLayers, viewerRef, zarrCesiumRefs]
      },
      add: { function: addLayerIntoMap, args: [] },
      opacity: {
        function: changeMapOpacity,
        args: [actualLayer, selectedLayers, viewerRef, zarrCesiumRefs]
      },
      'update-colors': {
        function: changeMapColors,
        args: [actualLayer, selectedLayers, viewerRef, zarrCesiumRefs]
      },
      'update-pyramid-levels': {
        function: changeMapPyramidLevels,
        args: [actualLayer, selectedLayers, zarrCesiumRefs]
      },
      'update-dimensions': {
        function: changeMapDimensions,
        args: [actualLayer, selectedLayers, viewerRef, zarrCesiumRefs]
      },
      'update-bounds': {
        function: changeMapBounds,
        args: [actualLayer, selectedLayers, zarrCesiumRefs]
      },
      'update-cube-slices': {
        function: changeMapCubeSlices,
        args: [actualLayer, selectedLayers, zarrCesiumRefs.cubeRef]
      },
      'update-velocity-slices': {
        function: changeMapVelocitySlices,
        args: [actualLayer, selectedLayers, zarrCesiumRefs.velocityCubeRef]
      },
      'update-cube-params': {
        function: changeMapCubeParams,
        args: [actualLayer, selectedLayers, zarrCesiumRefs]
      }
    };
    if (actionMap[layerAction]) {
      handleLayerAction(actionMap, layerAction);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLayers]);

  return (
    <div
      style={{
        top: '0px',
        bottom: '0px',
        position: 'absolute',
        width: '100%',
        zIndex: 0
      }}
      ref={ref}
    />
  );
}
