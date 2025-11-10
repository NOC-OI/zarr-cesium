'use client';
import React, { useEffect, useRef, useState } from 'react';
import { ColorMapName, ZarrCubeVelocityComponentProps } from './types';
import { allColorScales } from './jsColormaps';
import { ZarrCubeVelocityProvider } from './zarr-cube-velocity-provider';

export const ZarrCubeVelocityComponent: React.FC<ZarrCubeVelocityComponentProps> = ({
  viewerRef,
  urls,
  variables,
  bounds,
  maxElevation,
  dimensionNames,
  selectors,
  flipElevation,
  belowSeaLevel
}) => {
  const velocityCubeRef = useRef<ZarrCubeVelocityProvider | null>(null);
  const [opacity, setOpacity] = useState(1.0);
  const [scale, setScale] = useState<[number, number]>([0, 100]);
  const [colormap, setColormap] = useState<ColorMapName>('plasma');
  const [windOptions, setWindOptions] = useState({
    speedFactor: 12,
    lineWidth: { min: 1, max: 3 },
    lineLength: { min: 0, max: 400 },
    particlesTextureSize: 50,
    useViewerBounds: true,
    dynamic: true,
    flipY: true
  });

  const [verticalExaggeration, setVerticalExaggeration] = useState(1000);
  const [sliceSpacing, setSliceSpacing] = useState(1);
  const [cubeDimensions, setCubeDimensions] = useState<[number, number, number] | null>(null);

  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    if (!viewerRef.current) return;
    const currentKey = JSON.stringify({ uUrl: urls.u, vUrl: urls.v, bounds, maxElevation });
    if (lastKey.current === currentKey) return;
    lastKey.current = currentKey;

    const velocityProvider = new ZarrCubeVelocityProvider(viewerRef.current, {
      urls: { u: urls.u, v: urls.v },
      variables: variables,
      bounds,
      maxElevation: 30,
      scale,
      verticalExaggeration,
      belowSeaLevel,
      colormap,
      sliceSpacing,
      dimensionNames,
      selectors,
      flipElevation,
      windOptions
    });
    velocityCubeRef.current = velocityProvider;

    (async () => {
      await velocityProvider.load();
      setCubeDimensions(velocityProvider.cubeDimensions);
    })();

    return () => velocityProvider.destroy();
  }, [viewerRef, urls, bounds, maxElevation]);

  useEffect(() => {
    if (!viewerRef.current || !cubeDimensions) return;
    velocityCubeRef.current?.updateSlices({
      sliceSpacing,
      verticalExaggeration,
      belowSeaLevel
    });
  }, [sliceSpacing, verticalExaggeration, belowSeaLevel]);

  useEffect(() => {
    if (!viewerRef.current || !cubeDimensions) return;
    velocityCubeRef.current?.updateStyle({
      opacity,
      scale,
      colormap,
      windOptions
    });
  }, [verticalExaggeration, opacity, scale, colormap, windOptions]);

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
      <div>
        <label
          style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}
        >
          Vertical Exaggeration
        </label>
        <div style={{ display: 'flex' }}>
          <input
            type="range"
            min="0"
            max="10000"
            value={verticalExaggeration}
            onChange={e => setVerticalExaggeration(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <p>{verticalExaggeration}</p>
        </div>
      </div>
      <div>
        <label
          style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}
        >
          Slice Spacing
        </label>
        <div style={{ display: 'flex' }}>
          <input
            type="range"
            min="1"
            max="10"
            value={sliceSpacing}
            onChange={e => setSliceSpacing(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <p>{sliceSpacing}</p>
        </div>
      </div>
      <div>
        <label
          style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}
        >
          Opacity
        </label>
        <div style={{ display: 'flex' }}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={opacity}
            onChange={e => setOpacity(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          <p>{opacity}</p>
        </div>
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
            min="0"
            max="300"
            value={scale[0]}
            onChange={e => updateScale(e, 0)}
            style={{ width: '30%', padding: '5px' }}
          />
          <div>{scale[0]}</div>
          <input
            type="range"
            min="0"
            max="300"
            value={scale[1]}
            onChange={e => updateScale(e, 1)}
            style={{ width: '30%', padding: '5px' }}
          />
          <div>{scale[1]}</div>
        </div>
      </div>
      <div>
        <label
          style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}
        >
          Wind Options
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px' }}>Speed Factor:</label>
            <input
              type="text"
              value={windOptions.speedFactor}
              onChange={e =>
                setWindOptions(prev => ({
                  ...prev,
                  speedFactor: JSON.parse(e.target.value)
                }))
              }
              style={{ width: '100%', padding: '5px', fontSize: '12px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px' }}>Line Width:</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="range"
                min="0"
                max="10"
                value={windOptions.lineWidth.min}
                onChange={e =>
                  setWindOptions(prev => ({
                    ...prev,
                    lineWidth: { ...prev.lineWidth, min: JSON.parse(e.target.value) }
                  }))
                }
              />
              <div>{windOptions.lineWidth.min}</div>
              <input
                type="range"
                min="1"
                max="20"
                value={windOptions.lineWidth.max}
                onChange={e =>
                  setWindOptions(prev => ({
                    ...prev,
                    lineWidth: { ...prev.lineWidth, max: JSON.parse(e.target.value) }
                  }))
                }
              />
              <div>{windOptions.lineWidth.max}</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px' }}>Particles Texture Size:</label>
            <input
              type="text"
              value={windOptions.particlesTextureSize}
              onChange={e =>
                setWindOptions(prev => ({
                  ...prev,
                  particlesTextureSize: JSON.parse(e.target.value)
                }))
              }
              style={{ width: '100%', padding: '5px', fontSize: '12px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px' }}>Line Length:</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="range"
                min="0"
                max="1000"
                value={windOptions.lineLength.min}
                onChange={e =>
                  setWindOptions(prev => ({
                    ...prev,
                    lineLength: { ...prev.lineLength, min: JSON.parse(e.target.value) }
                  }))
                }
              />
              <div>{windOptions.lineLength.min}</div>
              <input
                type="range"
                min="1"
                max="1001"
                value={windOptions.lineLength.max}
                onChange={e =>
                  setWindOptions(prev => ({
                    ...prev,
                    lineLength: { ...prev.lineLength, max: JSON.parse(e.target.value) }
                  }))
                }
              />
              <div>{windOptions.lineLength.max}</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px' }}>Flip Y Axis:</label>
            <input
              type="checkbox"
              checked={windOptions.flipY}
              onChange={e =>
                setWindOptions(prev => ({
                  ...prev,
                  flipY: e.target.checked
                }))
              }
              style={{ width: '100%', padding: '5px', fontSize: '12px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px' }}>Use Viewer Bounds:</label>
            <input
              type="checkbox"
              checked={windOptions.useViewerBounds}
              onChange={e =>
                setWindOptions(prev => ({
                  ...prev,
                  useViewerBounds: e.target.checked
                }))
              }
              style={{ width: '100%', padding: '5px', fontSize: '12px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px' }}>Dynamic:</label>
            <input
              type="checkbox"
              checked={windOptions.dynamic}
              onChange={e =>
                setWindOptions(prev => ({
                  ...prev,
                  dynamic: e.target.checked
                }))
              }
              style={{ width: '100%', padding: '5px', fontSize: '12px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
