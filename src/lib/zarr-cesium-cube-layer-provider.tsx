import React, { useRef, useEffect, useState } from 'react';
import * as Cesium from 'cesium';
import * as zarr from 'zarrita';
import { type Viewer } from 'cesium';
import { identifyDimensionIndices } from './zarr-utils';
import { DimensionValues, ZarrCesiumCubeLayerProviderProps } from './types';

export const ZarrCesiumCubeLayerProvider: React.FC<ZarrCesiumCubeLayerProviderProps> = ({
  viewerRef,
  url,
  variable,
  bounds,
  maxElevation = 50,
  verticalExaggeration = 10000,
  sliceSpacing = 1,
  opacity = 0.7,
  showHorizontalSlices = true,
  showVerticalSlices = true,
  terrainActive = false
}) => {
  const [volumeData, setVolumeData] = useState<Float32Array | null>(null);
  const [dimensions, setDimensions] = useState<[number, number, number] | null>(null);
  const [latSliceIndex, setLatSliceIndex] = useState<number>(0);
  const [lonSliceIndex, setLonSliceIndex] = useState<number>(0);
  const [elevationSliceIndex, setElevationSliceIndex] = useState<number>(0);
  const [dimValues, setDimValues] = useState<DimensionValues>({ latValues: [], lonValues: [] });
  const horizontalPrimitivesRef = useRef<any[]>([]);
  const verticalPrimitivesRef = useRef<any[]>([]);
  const min = -1;
  const max = 1;

  useEffect(() => {
    const loadZarrVolume = async () => {
      let localDimValues: DimensionValues = { latValues: [], lonValues: [] };
      const store = new zarr.FetchStore(url);
      const zarrGroup = await zarr.open.v2(store, { kind: 'group' });
      const arrayLocation = await zarrGroup.resolve(variable);
      const array = await zarr.open(arrayLocation, { kind: 'array' });
      const shape = array.shape;
      const metadata = array.attrs;
      const dimNames: any = metadata['_ARRAY_DIMENSIONS'];
      const dimIndices = identifyDimensionIndices(dimNames);
      const height = shape[dimIndices.lat.index];
      const width = shape[dimIndices.lon.index];
      const x = [
        Math.floor(((bounds.west + 180) / 360) * width),
        Math.floor(((bounds.east + 180) / 360) * width)
      ];
      const y = [
        Math.floor(((90 - bounds.north) / 180) * height),
        Math.floor(((90 - bounds.south) / 180) * height)
      ];

      const sliceArgs: any[] = new Array(shape.length).fill(0);
      sliceArgs[dimIndices.time.index] = 0;
      const timeValues = await zarr.open(await zarrGroup.resolve(dimIndices.time.name), {
        kind: 'array'
      });
      const timeData = await zarr.get(timeValues);
      localDimValues.timeValues = Array.from(timeData.data) as number[];

      if (dimIndices.elevation) {
        sliceArgs[dimIndices.elevation.index] = zarr.slice(0, maxElevation);
        const elevationArray = await zarr.open(await zarrGroup.resolve(dimIndices.elevation.name), {
          kind: 'array'
        });
        const elevationData = await zarr.get(elevationArray);
        const elevationLevels = Array.from(elevationData.data) as number[];
        localDimValues.elevationValues = elevationLevels.slice(0, maxElevation);
      }
      sliceArgs[dimIndices.lat.index] = zarr.slice(y[0], y[1]);
      sliceArgs[dimIndices.lon.index] = zarr.slice(x[0], x[1]);

      const latArray = await zarr.open(await zarrGroup.resolve(dimIndices.lat.name), {
        kind: 'array'
      });
      const latData = await zarr.get(latArray);
      const latValues = Array.from(latData.data) as number[];
      localDimValues.latValues = latValues.slice(y[0], y[1]);

      const lonArray = await zarr.open(await zarrGroup.resolve(dimIndices.lon.name), {
        kind: 'array'
      });
      const lonData = await zarr.get(lonArray);
      const lonValues = Array.from(lonData.data) as number[];
      localDimValues.lonValues = lonValues.slice(x[0], x[1]);

      const data = await zarr.get(array, sliceArgs);
      const volume = data.data as Float32Array;
      setDimValues(localDimValues);
      setVolumeData(volume);
      const dims: [number, number, number] = [x[1] - x[0], y[1] - y[0], maxElevation];
      setDimensions(dims);
      setLatSliceIndex(Math.floor(dims[1] / 2));
      setLonSliceIndex(Math.floor(dims[0] / 2));
    };
    loadZarrVolume().catch(err => console.error(err));
  }, [url, variable, bounds, maxElevation]);
  function jetColorScale(value: number): [number, number, number, number] {
    const r = Math.max(Math.min(1.5 - Math.abs(4 * value - 3), 1), 0);
    const g = Math.max(Math.min(1.5 - Math.abs(4 * value - 2), 1), 0);
    const b = Math.max(Math.min(1.5 - Math.abs(4 * value - 1), 1), 0);
    return [r, g, b, opacity];
  }

  useEffect(() => {
    if (!viewerRef.current || !volumeData || !dimensions || !showHorizontalSlices) return;

    const viewer = viewerRef.current;
    const [nx, ny, nz] = dimensions;
    const primitives: any[] = [];

    const rect = Cesium.Rectangle.fromDegrees(bounds.west, bounds.south, bounds.east, bounds.north);

    const canvas = document.createElement('canvas');
    canvas.width = nx;
    canvas.height = ny;
    const ctx = canvas.getContext('2d')!;
    const imgData = ctx.createImageData(nx, ny);

    const elevationIndex = nz - 1 - elevationSliceIndex;
    for (let y = 0; y < ny; y++) {
      for (let x = 0; x < nx; x++) {
        const idx = elevationIndex * nx * ny + y * nx + x;
        const value = volumeData[idx];

        const pixelIdx = (y * nx + x) * 4;

        if (isNaN(value) || value === null || value === undefined) {
          imgData.data[pixelIdx + 0] = 0;
          imgData.data[pixelIdx + 1] = 0;
          imgData.data[pixelIdx + 2] = 0;
          imgData.data[pixelIdx + 3] = 0;
        } else {
          const normalized = (value - min) / (max - min);
          const [r, g, b, a] = jetColorScale(normalized);

          imgData.data[pixelIdx + 0] = Math.floor(r * 255);
          imgData.data[pixelIdx + 1] = Math.floor(g * 255);
          imgData.data[pixelIdx + 2] = Math.floor(b * 255);
          imgData.data[pixelIdx + 3] = Math.floor(a * 255);
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const elevationValue = dimValues.elevationValues
      ? dimValues.elevationValues[dimValues.elevationValues.length - 1 - elevationSliceIndex]
      : elevationSliceIndex * sliceSpacing;

    const maxElevationValue = dimValues.elevationValues
      ? Math.max(...dimValues.elevationValues)
      : 0;

    let heightMeters: number;
    if (terrainActive) {
      // Below sea surface (negative altitude)
      heightMeters = -elevationValue * verticalExaggeration;
    } else {
      // Floating cube visualization (surface on top)
      heightMeters = (maxElevationValue - elevationValue) * verticalExaggeration;
    }

    const primitive = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
          rectangle: rect,
          height: heightMeters,
          vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
        })
      }),
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        material: new Cesium.Material({
          fabric: {
            type: 'Image',
            uniforms: {
              image: canvas
            }
          }
        }),
        aboveGround: false
      }),
      asynchronous: false
    });

    viewer.scene.primitives.add(primitive);
    primitives.push(primitive);

    horizontalPrimitivesRef.current = primitives;

    return () => {
      primitives.forEach(p => viewer.scene.primitives.remove(p));
      horizontalPrimitivesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    viewerRef.current,
    volumeData,
    dimensions,
    Cesium,
    bounds,
    verticalExaggeration,
    sliceSpacing,
    opacity,
    showHorizontalSlices,
    elevationSliceIndex
  ]);

  useEffect(() => {
    if (!viewerRef.current || !volumeData || !dimensions || !showVerticalSlices) return;

    const viewer = viewerRef.current;
    const [nx, ny, nz] = dimensions;
    const primitives: any[] = [];

    const rect = Cesium.Rectangle.fromDegrees(bounds.west, bounds.south, bounds.east, bounds.north);

    const createLonElevationSlice = () => {
      const canvas = document.createElement('canvas');
      canvas.width = nx;
      canvas.height = nz;
      const ctx = canvas.getContext('2d')!;
      const imgData = ctx.createImageData(nx, nz);

      for (let z = 0; z < nz; z++) {
        for (let x = 0; x < nx; x++) {
          const idx = z * (ny * nx) + latSliceIndex * nx + x;
          const value = volumeData[idx];

          const canvasY = nz - 1 - z;
          const pixelIdx = (canvasY * nx + x) * 4;

          if (isNaN(value) || value === null || value === undefined) {
            imgData.data[pixelIdx + 0] = 0;
            imgData.data[pixelIdx + 1] = 0;
            imgData.data[pixelIdx + 2] = 0;
            imgData.data[pixelIdx + 3] = 0;
          } else {
            const normalized = (value - min) / (max - min);
            const [r, g, b, a] = jetColorScale(normalized);
            imgData.data[pixelIdx + 0] = Math.floor(r * 255);
            imgData.data[pixelIdx + 1] = Math.floor(g * 255);
            imgData.data[pixelIdx + 2] = Math.floor(b * 255);
            imgData.data[pixelIdx + 3] = Math.floor(a * 255);
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      // document.body.appendChild(canvas);
      // canvas.style.position = 'fixed';
      // canvas.style.top = '10px';
      // canvas.style.left = '10px';
      // canvas.style.zIndex = '10000';
      // canvas.style.border = '2px solid red';
      // canvas.style.imageRendering = 'pixelated';
      // canvas.style.width = '400px';
      // canvas.style.height = '400px';

      const latFraction = latSliceIndex / (ny - 1);
      const sliceLat = bounds.north - latFraction * (bounds.north - bounds.south);

      const positions = [];
      const sts = [];
      const indices = [];

      const segmentsX = nx - 1;
      const segmentsZ = nz - 1;

      // Create vertices
      for (let iz = 0; iz <= segmentsZ; iz++) {
        const heightFraction = iz / segmentsZ;
        // const height = baseAltitude + heightFraction * nz * verticalExaggeration;
        const elevationValue = dimValues.elevationValues
          ? dimValues.elevationValues[dimValues.elevationValues.length - 1 - iz]
          : iz * sliceSpacing;
        const maxElevation = dimValues.elevationValues ? Math.max(...dimValues.elevationValues) : 0;
        let height: number;
        if (terrainActive) {
          height = -elevationValue * verticalExaggeration;
        } else {
          height = (maxElevation - elevationValue) * verticalExaggeration;
        }
        for (let ix = 0; ix <= segmentsX; ix++) {
          const lonFraction = ix / segmentsX;
          const lon = bounds.west + lonFraction * (bounds.east - bounds.west);

          const cart = Cesium.Cartesian3.fromDegrees(lon, sliceLat, height);
          positions.push(cart.x, cart.y, cart.z);

          sts.push(lonFraction, 1 - heightFraction);
        }
      }

      for (let iz = 0; iz < segmentsZ; iz++) {
        for (let ix = 0; ix < segmentsX; ix++) {
          const i0 = iz * (segmentsX + 1) + ix;
          const i1 = i0 + 1;
          const i2 = i0 + (segmentsX + 1);
          const i3 = i2 + 1;

          indices.push(i0, i2, i1);
          indices.push(i1, i2, i3);
        }
      }

      const geometry = new Cesium.Geometry({
        attributes: {
          position: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
            componentsPerAttribute: 3,
            values: new Float64Array(positions)
          }),
          st: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 2,
            values: new Float32Array(sts)
          })
        },
        indices: new Uint16Array(indices),
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        boundingSphere: Cesium.BoundingSphere.fromVertices(new Float64Array(positions))
      });

      const primitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: geometry
        }),
        appearance: new Cesium.MaterialAppearance({
          material: new Cesium.Material({
            fabric: { type: 'Image', uniforms: { image: canvas } }
          }),
          faceForward: false
        }),
        asynchronous: false
      });

      return primitive;
    };

    const createLatElevationSlice = () => {
      const canvas = document.createElement('canvas');
      canvas.width = ny;
      canvas.height = nz;
      const ctx = canvas.getContext('2d')!;
      const imgData = ctx.createImageData(ny, nz);

      for (let z = 0; z < nz; z++) {
        for (let y = 0; y < ny; y++) {
          const idx = z * nx * ny + y * nx + lonSliceIndex;
          const value = volumeData[idx];

          const canvasY = nz - 1 - z;
          const pixelIdx = (canvasY * ny + y) * 4;

          if (isNaN(value) || value === null || value === undefined) {
            imgData.data[pixelIdx + 0] = 0;
            imgData.data[pixelIdx + 1] = 0;
            imgData.data[pixelIdx + 2] = 0;
            imgData.data[pixelIdx + 3] = 0;
          } else {
            const normalized = (value - min) / (max - min);
            const [r, g, b, a] = jetColorScale(normalized);
            imgData.data[pixelIdx + 0] = Math.floor(r * 255);
            imgData.data[pixelIdx + 1] = Math.floor(g * 255);
            imgData.data[pixelIdx + 2] = Math.floor(b * 255);
            imgData.data[pixelIdx + 3] = Math.floor(a * 255);
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      const lonFraction = lonSliceIndex / (nx - 1);
      const sliceLon = bounds.west + lonFraction * (bounds.east - bounds.west);

      const positions = [];
      const sts = [];
      const indices = [];

      const segmentsY = ny - 1;
      const segmentsZ = nz - 1;

      for (let iz = 0; iz <= segmentsZ; iz++) {
        const heightFraction = iz / segmentsZ;
        // const height = baseAltitude + heightFraction * nz * verticalExaggeration;
        const elevationValue = dimValues.elevationValues
          ? dimValues.elevationValues[dimValues.elevationValues.length - 1 - iz]
          : iz * sliceSpacing;
        // const height = baseAltitude - elevationValue * verticalExaggeration;
        const maxElevation = dimValues.elevationValues ? Math.max(...dimValues.elevationValues) : 0;
        let height: number;
        if (terrainActive) {
          height = -elevationValue * verticalExaggeration;
        } else {
          height = (maxElevation - elevationValue) * verticalExaggeration;
        }

        for (let iy = 0; iy <= segmentsY; iy++) {
          const latFraction = iy / segmentsY;
          const lat = bounds.south + latFraction * (bounds.north - bounds.south);

          const cart = Cesium.Cartesian3.fromDegrees(sliceLon, lat, height);
          positions.push(cart.x, cart.y, cart.z);
          sts.push(1 - latFraction, 1 - heightFraction);
        }
      }

      for (let iz = 0; iz < segmentsZ; iz++) {
        for (let iy = 0; iy < segmentsY; iy++) {
          const i0 = iz * (segmentsY + 1) + iy;
          const i1 = i0 + 1;
          const i2 = i0 + (segmentsY + 1);
          const i3 = i2 + 1;

          indices.push(i0, i2, i1);
          indices.push(i1, i2, i3);
        }
      }

      const geometry = new Cesium.Geometry({
        attributes: {
          position: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
            componentsPerAttribute: 3,
            values: new Float64Array(positions)
          }),
          st: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 2,
            values: new Float32Array(sts)
          })
        },
        indices: new Uint16Array(indices),
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        boundingSphere: Cesium.BoundingSphere.fromVertices(new Float64Array(positions))
      });

      const primitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: geometry
        }),
        appearance: new Cesium.MaterialAppearance({
          material: new Cesium.Material({
            fabric: { type: 'Image', uniforms: { image: canvas } }
          }),
          faceForward: false
        }),
        asynchronous: false
      });

      return primitive;
    };

    const lonElevationPrimitive = createLonElevationSlice();
    const latElevationPrimitive = createLatElevationSlice();

    viewer.scene.primitives.add(lonElevationPrimitive);
    viewer.scene.primitives.add(latElevationPrimitive);

    primitives.push(lonElevationPrimitive, latElevationPrimitive);
    verticalPrimitivesRef.current = primitives;

    return () => {
      primitives.forEach(p => viewer.scene.primitives.remove(p));
      verticalPrimitivesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    viewerRef.current,
    volumeData,
    dimensions,
    Cesium,
    bounds,
    verticalExaggeration,
    latSliceIndex,
    lonSliceIndex,
    opacity,
    showVerticalSlices,
    terrainActive
  ]);

  if (!dimensions) return null;

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
          {dimValues.elevationValues
            ? dimValues.elevationValues[
                dimValues.elevationValues.length - 1 - elevationSliceIndex
              ].toFixed(1)
            : elevationSliceIndex}{' '}
          m
        </label>
        <input
          type="range"
          min="0"
          max={dimensions[2] - 1}
          value={elevationSliceIndex}
          onChange={e => setElevationSliceIndex(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>Lon × Lat plane</div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label
          style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}
        >
          Latitude Slice:{' '}
          {dimValues.latValues ? dimValues.latValues[latSliceIndex].toFixed(2) : latSliceIndex} °
          {/* Latitude Slice: {latSliceIndex} / {dimensions[1] - 1} */}
        </label>
        <input
          type="range"
          min="0"
          max={dimensions[1] - 1}
          value={latSliceIndex}
          onChange={e => setLatSliceIndex(parseInt(e.target.value))}
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
          {dimValues.lonValues ? dimValues.lonValues[lonSliceIndex].toFixed(2) : lonSliceIndex} °
          {/* Longitude Slice: {lonSliceIndex} / {dimensions[0] - 1} */}
        </label>
        <input
          type="range"
          min="0"
          max={dimensions[0] - 1}
          value={lonSliceIndex}
          onChange={e => setLonSliceIndex(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
          Lat × Elevation plane
        </div>
      </div>
    </div>
  );
};
