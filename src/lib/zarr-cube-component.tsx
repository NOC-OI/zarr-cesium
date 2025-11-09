'use client';
import React, { useEffect, useRef, useState } from 'react';
import { ZarrCubeProvider } from './zarr-cube-provider';
import { ColorMapName, DimensionValues, ZarrCubeComponentProps } from './types';
import { allColorScales } from './jsColormaps';

export const ZarrCubeComponent: React.FC<ZarrCubeComponentProps> = ({
  viewerRef,
  url,
  variable,
  bounds,
  showVerticalSlices,
  showHorizontalSlices,
  belowSeaLevel,
  dimensionNames,
  selectors,
  flipElevation,
  maxElevation
}) => {
  const cubeRef = useRef<ZarrCubeProvider | null>(null);
  const [latSlice, setLatSlice] = useState(0);
  const [lonSlice, setLonSlice] = useState(0);
  const [elevationSlice, setElevationSlice] = useState(0);
  const [dimensionValues, setDimensionValues] = useState<DimensionValues>({
    latValues: [],
    longitude: []
  });
  const [verticalExaggeration, setVerticalExaggeration] = useState(1000);
  const [opacity, setOpacity] = useState(1.0);
  const [scale, setScale] = useState<[number, number]>([-1, 1]);
  const [colormap, setColormap] = useState<ColorMapName>('viridis');

  const [cubeDimensions, setCubeDimensions] = useState<[number, number, number] | null>(null);
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    if (!viewerRef.current) return;
    const currentKey = JSON.stringify({ url, variable, bounds, maxElevation });
    if (lastKey.current === currentKey) return;
    lastKey.current = currentKey;

    const layer = new ZarrCubeProvider(viewerRef.current, {
      url,
      variable,
      bounds,
      maxElevation,
      verticalExaggeration,
      opacity,
      showHorizontalSlices,
      showVerticalSlices,
      belowSeaLevel,
      dimensionNames,
      selectors,
      flipElevation,
      scale,
      colormap
    });
    cubeRef.current = layer;
    layer.load().then(function () {
      setDimensionValues(layer.dimensionValues);
      setCubeDimensions(layer.cubeDimensions);
      layer.updateSlices({
        latIndex: latSlice,
        lonIndex: lonSlice,
        elevationIndex: elevationSlice
      });
    });
    return () => {
      layer.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, variable, bounds, maxElevation]);

  useEffect(() => {
    cubeRef.current?.updateSlices({
      latIndex: latSlice,
      lonIndex: lonSlice,
      elevationIndex: elevationSlice
    });
  }, [latSlice, lonSlice, elevationSlice]);

  useEffect(() => {
    cubeRef.current?.updateStyle({
      verticalExaggeration,
      opacity,
      scale,
      colormap
    });
  }, [verticalExaggeration, opacity, scale, colormap]);

  const updateScale = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = parseFloat(e.target.value);
    if (index === 0) {
      if (newValue >= scale[1]) return;
    }
    if (index === 1) {
      if (newValue <= scale[0]) return;
    }
    const newScale: [number, number] = index === 0 ? [newValue, scale[1]] : [scale[0], newValue];
    setScale(newScale);
  };

  if (!cubeDimensions) return null;
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 10,
        right: 10,
        background: 'rgba(255,255,255,0.9)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        minWidth: '250px',
        zIndex: 1000
      }}
    >
      <div style={{ marginBottom: '15px' }}>
        <label
          style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}
        >
          Elevation Slice:{' '}
          {dimensionValues.elevation
            ? flipElevation
              ? Number(
                  dimensionValues.elevation[dimensionValues.elevation.length - 1 - elevationSlice]
                ).toFixed(2)
              : Number(dimensionValues.elevation[elevationSlice]).toFixed(2)
            : elevationSlice}{' '}
          m
        </label>
        <input
          type="range"
          min="0"
          max={cubeDimensions[2] - 1}
          value={elevationSlice}
          onChange={e => setElevationSlice(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>Lon × Lat plane</div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label
          style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}
        >
          Latitude Slice:{' '}
          {dimensionValues.lat ? dimensionValues.lat[latSlice].toFixed(2) : latSlice} °
        </label>
        <input
          type="range"
          min="0"
          max={cubeDimensions[1] - 1}
          value={latSlice}
          onChange={e => setLatSlice(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
          Lon × Elevation plane
        </div>
      </div>
      <div>
        <label
          style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}
        >
          Longitude Slice:{' '}
          {dimensionValues.lon ? dimensionValues.lon[lonSlice].toFixed(2) : lonSlice} °
        </label>
        <input
          type="range"
          min="0"
          max={cubeDimensions[0] - 1}
          value={lonSlice}
          onChange={e => setLonSlice(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
          Lat × Elevation plane
        </div>
      </div>
      <div>
        <label
          style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}
        >
          Vertical Exaggeration
        </label>
        <input
          type="range"
          min="0"
          max="100000"
          value={verticalExaggeration}
          onChange={e => setVerticalExaggeration(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      <div>
        <label
          style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}
        >
          Opacity
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={opacity}
          onChange={e => setOpacity(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      <div>
        <label
          style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}
        >
          Color Map
        </label>
        <select
          value={colormap}
          onChange={e => setColormap(e.target.value as ColorMapName)}
          style={{ width: '100%', padding: '5px' }}
        >
          {allColorScales.map(scale => (
            <option key={scale} value={scale}>
              {scale.charAt(0).toUpperCase() + scale.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          style={{
            display: 'block',
            marginTop: '5px',
            marginBottom: '5px',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
        >
          Min and Max Scale
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Use a slider for min scale */}
          <input
            type="range"
            min="-50"
            max="50"
            value={scale[0]}
            onChange={e => updateScale(e, 0)}
            style={{ width: '30%', padding: '5px' }}
          />
          <div>{scale[0]}</div>
          <input
            type="range"
            min="-50"
            max="50"
            value={scale[1]}
            onChange={e => updateScale(e, 1)}
            style={{ width: '30%', padding: '5px' }}
          />
          <div>{scale[1]}</div>
        </div>
      </div>
    </div>
  );
};
