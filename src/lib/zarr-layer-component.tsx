'use client';
import React, { useEffect, useRef, useState } from 'react';
import { ColorMapName, ZarrLayerComponentProps } from './types';
import { allColorScales } from './jsColormaps';
import { ZarrImageryLayer, ZarrLayerProvider } from './zarr-layer-provider';

export const ZarrLayerComponent: React.FC<ZarrLayerComponentProps> = ({
  viewerRef,
  url,
  variable
}) => {
  const zarrLayerRef = useRef<ZarrImageryLayer | null>(null);
  const [isLayerReady, setIsLayerReady] = useState(false);
  const [opacity, setOpacity] = useState(1.0);
  const [scale, setScale] = useState<[number, number]>([30, 37]);
  const [colormap, setColormap] = useState<ColorMapName>('viridis');
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    if (!viewerRef.current) return;
    const currentKey = JSON.stringify({ url, variable });
    if (lastKey.current === currentKey) return;
    lastKey.current = currentKey;

    const options = {
      url,
      variable,
      scale,
      opacity,
      colormap,
      tileWidth: 256,
      tileHeight: 256,
      minimumLevel: 0,
      maximumLevel: 8
    };

    (async () => {
      if (viewerRef.current) {
        const imageryLayer = await ZarrLayerProvider.createLayer(viewerRef.current, options);
        viewerRef.current.imageryLayers.add(imageryLayer);
        zarrLayerRef.current = imageryLayer;
        // viewer.camera.flyTo({ destination: provider.rectangle });
        setIsLayerReady(true);
      }
    })();
    return () => {
      if (!viewerRef.current) return;

      if (zarrLayerRef.current) {
        viewerRef.current.imageryLayers.remove(zarrLayerRef.current, false);
        zarrLayerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerRef, url, variable]);

  useEffect(() => {
    if (!zarrLayerRef.current) return;
    zarrLayerRef.current?.updateStyle({
      opacity,
      scale,
      colormap
    });
  }, [opacity, scale, colormap]);

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
  if (!isLayerReady) return null;
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
