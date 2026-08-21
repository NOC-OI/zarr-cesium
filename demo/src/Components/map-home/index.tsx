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
import { ZarrCubeProvider, ZarrCubeVelocityProvider, ZarrLayerProvider } from 'zarr-cesium';
import { CESIUM_START_COORDINATES, VERTICAL_EXAGGERATION } from '../../lib/map-layers/utils';
import { PointQueryInfo } from '../point-query-info';
import { TransectQueryInfo } from '../transect-query-info';
import type { QueryPosition } from 'zarr-cesium';

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
  const queryHandlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);
  const queryMarkerRef = useRef<Cesium.Entity | null>(null);
  const queryMarkerLayerRef = useRef('');
  const transectCaptureRef = useRef<((position: QueryPosition) => void) | null>(null);
  const transectEntitiesRef = useRef<Cesium.Entity[]>([]);
  const transectPositionsRef = useRef<QueryPosition[]>([]);
  const transectLayerRef = useRef('');

  const { setFlashMessage, setInfoButtonBox, setLoading, transectLayerName, setTransectLayerName } =
    useContextHandle();
  Cesium.Camera.DEFAULT_VIEW_RECTANGLE = CESIUM_START_COORDINATES;

  const clearTransect = useCallback(() => {
    const viewer = viewerRef.current;
    if (viewer) {
      transectEntitiesRef.current.forEach(entity => viewer.entities.remove(entity));
    }
    transectEntitiesRef.current = [];
    transectPositionsRef.current = [];
    transectCaptureRef.current = null;
    transectLayerRef.current = '';
  }, []);

  const clearQueryMarker = useCallback(() => {
    const viewer = viewerRef.current;
    if (viewer && queryMarkerRef.current) viewer.entities.remove(queryMarkerRef.current);
    queryMarkerRef.current = null;
    queryMarkerLayerRef.current = '';
  }, []);

  const registerTransectCapture = useCallback(
    (handler: ((position: QueryPosition) => void) | null) => {
      transectCaptureRef.current = handler;
      if (handler) {
        clearTransect();
        transectCaptureRef.current = handler;
      }
    },
    [clearTransect]
  );

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
          infoBox: false,
          selectionIndicator: false,
          baseLayer: Cesium.ImageryLayer.fromProviderAsync(
            Cesium.ArcGisMapServerImageryProvider.fromUrl(
              'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
              {}
            )
          )
        });
        queryHandlerRef.current?.destroy();
        queryHandlerRef.current = new Cesium.ScreenSpaceEventHandler(
          viewerRef.current.scene.canvas
        );
        queryHandlerRef.current.setInputAction((click: { position: Cesium.Cartesian2 }) => {
          const viewer = viewerRef.current;
          if (!viewer) return;

          const ray = viewer.camera.getPickRay(click.position);
          const cartesian = ray ? viewer.scene.globe.pick(ray, viewer.scene) : undefined;
          if (!cartesian) return;
          const position = Cesium.Cartographic.fromCartesian(cartesian);
          const longitude = Cesium.Math.toDegrees(position.longitude);
          const latitude = Cesium.Math.toDegrees(position.latitude);
          if (transectCaptureRef.current) {
            const queryPosition: QueryPosition = [longitude, latitude];
            transectPositionsRef.current.push(queryPosition);
            transectEntitiesRef.current.push(
              viewer.entities.add({
                position: cartesian,
                point: {
                  pixelSize: 11,
                  color: Cesium.Color.CYAN,
                  outlineColor: Cesium.Color.BLACK,
                  outlineWidth: 2,
                  disableDepthTestDistance: Number.POSITIVE_INFINITY
                }
              })
            );
            if (transectPositionsRef.current.length === 2) {
              transectEntitiesRef.current.push(
                viewer.entities.add({
                  polyline: {
                    positions: transectPositionsRef.current.map(([lon, lat]) =>
                      Cesium.Cartesian3.fromDegrees(lon, lat)
                    ),
                    width: 3,
                    material: Cesium.Color.CYAN,
                    clampToGround: true
                  }
                })
              );
            }
            transectCaptureRef.current(queryPosition);
            return;
          }

          let queryLayer: Cesium.ImageryLayer | undefined;
          for (let index = viewer.imageryLayers.length - 1; index >= 0; index--) {
            const candidate = viewer.imageryLayers.get(index);
            if (candidate.show && candidate.imageryProvider instanceof ZarrLayerProvider) {
              queryLayer = candidate;
              break;
            }
          }
          if (!queryLayer && !cubeRef.current && !velocityCubeRef.current) return;
          if (queryMarkerRef.current) {
            viewer.entities.remove(queryMarkerRef.current);
            queryMarkerRef.current = null;
            queryMarkerLayerRef.current = '';
          }
          const cube = cubeRef.current;
          const velocityCube = velocityCubeRef.current;
          const velocityContainsPoint = velocityCube
            ? longitude >= velocityCube.bounds.west &&
              longitude <= velocityCube.bounds.east &&
              latitude >= velocityCube.bounds.south &&
              latitude <= velocityCube.bounds.north
            : false;
          const cubeContainsPoint = cube
            ? longitude >= cube.bounds.west &&
              longitude <= cube.bounds.east &&
              latitude >= cube.bounds.south &&
              latitude <= cube.bounds.north
            : false;
          const provider = velocityContainsPoint
            ? velocityCube!
            : cubeContainsPoint
              ? cube!
              : (queryLayer?.imageryProvider as ZarrLayerProvider | undefined);
          if (!provider) return;
          const layerName =
            provider instanceof ZarrCubeProvider || provider instanceof ZarrCubeVelocityProvider
              ? provider.id || (provider instanceof ZarrCubeProvider ? 'Zarr cube' : 'Zarr velocity cube')
              : ((queryLayer as Cesium.ImageryLayer & { id?: string }).id ?? 'Zarr layer');
          queryMarkerRef.current = viewer.entities.add({
            position: cartesian,
            point: {
              pixelSize: 12,
              color: Cesium.Color.YELLOW,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
          });
          queryMarkerLayerRef.current = layerName;
          setInfoButtonBox({
            title:
              provider instanceof ZarrCubeProvider || provider instanceof ZarrCubeVelocityProvider
                ? `${provider.constructor.name} query`
                : 'ZarrLayerProvider query',
            layerName,
            onClose: clearQueryMarker,
            content: (
              <PointQueryInfo
                key={`${layerName}/${longitude}/${latitude}`}
                provider={provider}
                layerName={layerName}
                longitude={longitude}
                latitude={latitude}
              />
            )
          });
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
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
    [clearQueryMarker, dispatch, gebcoTerrainEnabled, setFlashMessage, setInfoButtonBox, setLoading]
  );

  useEffect(() => {
    return () => {
      queryHandlerRef.current?.destroy();
      queryHandlerRef.current = null;
      clearQueryMarker();
      clearTransect();
    };
  }, [clearQueryMarker, clearTransect]);

  useEffect(() => {
    if (!transectLayerName || !viewerRef.current) return;
    const selected = selectedLayers[transectLayerName];
    let provider: ZarrLayerProvider | ZarrCubeProvider | undefined;
    if (selected?.dataType === 'zarr-cube' && cubeRef.current?.id === transectLayerName) {
      provider = cubeRef.current;
    } else if (selected?.dataType === 'zarr-cesium') {
      const viewer = viewerRef.current;
      for (let index = 0; index < viewer.imageryLayers.length; index++) {
        const layer = viewer.imageryLayers.get(index) as Cesium.ImageryLayer & { id?: string };
        if (layer.id === transectLayerName && layer.imageryProvider instanceof ZarrLayerProvider) {
          provider = layer.imageryProvider;
          break;
        }
      }
    }
    if (provider) {
      const display = selected.params as { colormap?: string; scale?: [number, number] };
      clearTransect();
      transectLayerRef.current = transectLayerName;
      setInfoButtonBox({
        title: 'Transect query',
        layerName: transectLayerName,
        onClose: clearTransect,
        content: (
          <TransectQueryInfo
            key={transectLayerName}
            provider={provider}
            layerName={transectLayerName}
            registerCapture={handler => {
              registerTransectCapture(handler);
              if (handler) transectLayerRef.current = transectLayerName;
            }}
            clearCapture={clearTransect}
            colormap={display.colormap}
            scale={display.scale}
          />
        )
      });
    }
    setTransectLayerName('');
  }, [
    clearTransect,
    registerTransectCapture,
    selectedLayers,
    setInfoButtonBox,
    setTransectLayerName,
    transectLayerName
  ]);

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
    if (
      queryMarkerRef.current &&
      queryMarkerLayerRef.current &&
      !selectedLayers[queryMarkerLayerRef.current]
    ) {
      viewerRef.current.entities.remove(queryMarkerRef.current);
      queryMarkerRef.current = null;
      queryMarkerLayerRef.current = '';
    }
    if (transectLayerRef.current && !selectedLayers[transectLayerRef.current]) {
      clearTransect();
    }
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
