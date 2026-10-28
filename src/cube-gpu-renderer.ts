import * as Cesium from 'cesium';
import type ndarray from 'ndarray';
import type {
  BoundsProps,
  CubeCrossSectionPoint,
  CubeGpuRendererOptions,
  DimIndicesProps,
  ElevationMode
} from './types';
import type { ColorScaleProps } from 'zarr-maps-colormap';
import { getCubeDimensions } from 'zarr-maps-tiling';
import { cubeFragmentShaderSource, cubeVertexShaderSource } from './shaders';

// Cesium exports these renderer classes at runtime, but deliberately omits some
// of them from its public TypeScript surface. Keeping the untyped access in this
// module makes that dependency explicit and gives the provider a clean fallback.
const Renderer = Cesium as any;

type SliceOrientation = 0 | 1 | 2 | 3;

interface SliceState {
  latitude: number;
  longitude: number;
  elevation: number;
}

/** Low-level Cesium primitive that keeps cube values and colormapping on the GPU. */
export class CubeGpuRenderer {
  show = true;
  private readonly options: CubeGpuRendererOptions;
  private readonly atlas: Float32Array;
  private readonly elevationValues: number[];
  private slices: SliceState = { latitude: 0, longitude: 0, elevation: 0 };
  private commands: any[] = [];
  private volumeTexture: any;
  private colormapTexture: any;
  private context: any;
  private destroyed = false;
  private styleDirty = false;
  private geometryDirty = false;
  private crossSection: { start: CubeCrossSectionPoint; end: CubeCrossSectionPoint } | null = null;

  static supportReason(scene: any, dimensions: [number, number, number]): string | null {
    const context = scene?.context;
    if (!context) return 'Cesium WebGL context is unavailable';
    if (!context.floatingPointTexture) return 'floating-point textures are unavailable';
    const maximumTextureSize =
      context.maximumTextureSize ?? context._gl?.getParameter(context._gl.MAX_TEXTURE_SIZE);
    if (dimensions[0] > maximumTextureSize || dimensions[1] * dimensions[2] > maximumTextureSize) {
      return `cube atlas ${dimensions[0]}x${dimensions[1] * dimensions[2]} exceeds MAX_TEXTURE_SIZE ${maximumTextureSize}`;
    }
    return null;
  }

  constructor(options: CubeGpuRendererOptions) {
    this.options = options;
    this.options.opacity = Math.max(0, Math.min(1, this.options.opacity));
    this.elevationValues = Array.from(options.dimensionElevations, Number);
    this.atlas = this.createAtlas();
    try {
      this.initialize(options.scene.context);
    } catch (error) {
      this.destroy();
      throw error;
    }
  }

  /**
   * Updates the rendered slices based on the provided indices.
   *
   * @param latitude - The index of the latitude slice to display.
   * @param longitude - The index of the longitude slice to display.
   * @param elevation - The index of the elevation slice to display.
   */
  setSlices(latitude: number, longitude: number, elevation: number): void {
    const [nx, ny, nz] = this.options.dimensions;
    this.slices = {
      latitude: ny <= 1 ? 0 : latitude / (ny - 1),
      longitude: nx <= 1 ? 0 : longitude / (nx - 1),
      elevation: nz <= 1 ? 0 : elevation / (nz - 1)
    };
    if (this.isWarped) this.geometryDirty = true;
  }

  /**
   * Updates the rendered style based on the provided color scale and opacity.
   *
   * @param colors - The color scale to use for rendering.
   * @param min - The minimum value of the color scale.
   * @param max - The maximum value of the color scale.
   * @param opacity - The opacity of the rendered cube.
   */
  setStyle(colors: ColorScaleProps['colors'], min: number, max: number, opacity: number): void {
    const wasOpaque = this.options.opacity >= 1;
    this.options.colors = colors;
    this.options.colorMin = min;
    this.options.colorMax = max;
    this.options.opacity = Math.max(0, Math.min(1, opacity));
    this.styleDirty = true;
    if (wasOpaque !== this.options.opacity >= 1) this.geometryDirty = true;
  }

  /**
   * Updates the vertical layout of the cube based on the provided vertical exaggeration and elevation mode.
   *
   * @param verticalExaggeration - The factor by which to exaggerate the vertical dimension.
   * @param elevationMode - The mode to use for rendering elevation ('height' or 'depth').
   */
  setVerticalLayout(verticalExaggeration: number, elevationMode: ElevationMode): void {
    if (
      verticalExaggeration !== this.options.verticalExaggeration ||
      elevationMode !== this.options.elevationMode
    ) {
      this.options.verticalExaggeration = verticalExaggeration;
      this.options.elevationMode = elevationMode;
      this.geometryDirty = true;
    }
  }

  /**
   * Updates the rendered slices based on the provided cross-section points.
   *
   * @param start - The starting point of the cross-section.
   * @param end - The ending point of the cross-section.
   */
  setCrossSection(start: CubeCrossSectionPoint, end: CubeCrossSectionPoint): void {
    const wasVisible = this.crossSection !== null;
    this.crossSection = { start: [...start], end: [...end] };
    if (!wasVisible || this.isWarped) this.geometryDirty = true;
  }

  /**
   * Clears the cross-section, reverting to the default slice rendering.
   */
  clearCrossSection(): void {
    if (!this.crossSection) return;
    this.crossSection = null;
    this.geometryDirty = true;
  }

  /**
   * Updates the renderer, rebuilding commands and textures as needed.
   *
   * @param frameState - The current frame state from Cesium.
   */
  update(frameState: any): void {
    if (!this.show || this.destroyed) return;
    if (!this.context) this.initialize(frameState.context);
    if (this.geometryDirty) this.rebuildCommands();
    if (this.styleDirty) this.replaceColormapTexture();
    for (const command of this.commands) frameState.commandList.push(command);
  }

  /**
   * Checks if the renderer has been destroyed.
   *
   * @returns True if the renderer has been destroyed, false otherwise.
   */
  isDestroyed(): boolean {
    return this.destroyed;
  }

  /**
   * Destroys the renderer, releasing all associated resources.
   */
  destroy(): undefined {
    if (this.destroyed) return undefined;
    this.destroyCommands();
    this.destroyResource(this.volumeTexture);
    this.destroyResource(this.colormapTexture);
    this.volumeTexture = undefined;
    this.colormapTexture = undefined;
    this.destroyed = true;
    return undefined;
  }

  private createAtlas(): Float32Array {
    const [nx, ny, nz] = this.options.dimensions;
    const result = new Float32Array(nx * ny * nz * 4);
    const { indicesOrder, strides } = getCubeDimensions(
      this.options.dimensions,
      this.options.dimensionIndices
    );
    let target = 0;
    for (let z = 0; z < nz; z++) {
      for (let y = 0; y < ny; y++) {
        for (let x = 0; x < nx; x++) {
          const coordinate: Record<string, number> = { lon: x, lat: y, elevation: z };
          const source =
            coordinate[indicesOrder[0]] * strides[indicesOrder[0]] +
            coordinate[indicesOrder[1]] * strides[indicesOrder[1]] +
            coordinate[indicesOrder[2]] * strides[indicesOrder[2]];
          const raw = Number(this.options.data.data[source]);
          const value = raw * this.options.scaleFactor + this.options.addOffset;
          const valid =
            Number.isFinite(raw) &&
            Number.isFinite(value) &&
            (!this.options.useFillValue || raw !== this.options.fillValue) &&
            (this.options.noDataMin === undefined || value >= this.options.noDataMin) &&
            (this.options.noDataMax === undefined || value <= this.options.noDataMax);
          result[target] = valid ? raw : 0;
          result[target + 1] = 0;
          result[target + 2] = 0;
          result[target + 3] = valid ? 1 : 0;
          target += 4;
        }
      }
    }
    return result;
  }

  private initialize(context: any): void {
    this.context = context;
    const [nx, ny, nz] = this.options.dimensions;
    this.volumeTexture = new Renderer.Texture({
      context,
      width: nx,
      height: ny * nz,
      pixelFormat: Renderer.PixelFormat.RGBA,
      pixelDatatype: Renderer.PixelDatatype.FLOAT,
      flipY: false,
      sampler: new Renderer.Sampler({
        minificationFilter: Renderer.TextureMinificationFilter.NEAREST,
        magnificationFilter: Renderer.TextureMagnificationFilter.NEAREST,
        wrapS: Renderer.TextureWrap.CLAMP_TO_EDGE,
        wrapT: Renderer.TextureWrap.CLAMP_TO_EDGE
      }),
      source: { width: nx, height: ny * nz, arrayBufferView: this.atlas }
    });
    this.replaceColormapTexture();
    this.rebuildCommands();
  }

  private replaceColormapTexture(): void {
    if (!this.context) return;
    this.destroyResource(this.colormapTexture);
    const colors: Array<number[] | string> =
      this.options.colors.length > 0 ? this.options.colors : [[0, 0, 0]];
    const pixels = new Uint8Array(colors.length * 4);
    colors.forEach((color, index) => {
      const rgba =
        typeof color === 'string'
          ? (Cesium.Color.fromCssColorString(color)?.toBytes() ?? [0, 0, 0, 255])
          : color;
      pixels[index * 4] = rgba[0];
      pixels[index * 4 + 1] = rgba[1];
      pixels[index * 4 + 2] = rgba[2];
      pixels[index * 4 + 3] = rgba.length > 3 ? rgba[3] : 255;
    });
    this.colormapTexture = new Renderer.Texture({
      context: this.context,
      width: colors.length,
      height: 1,
      pixelFormat: Renderer.PixelFormat.RGBA,
      pixelDatatype: Renderer.PixelDatatype.UNSIGNED_BYTE,
      flipY: false,
      sampler: new Renderer.Sampler({
        minificationFilter: Renderer.TextureMinificationFilter.LINEAR,
        magnificationFilter: Renderer.TextureMagnificationFilter.LINEAR,
        wrapS: Renderer.TextureWrap.CLAMP_TO_EDGE,
        wrapT: Renderer.TextureWrap.CLAMP_TO_EDGE
      }),
      source: { width: colors.length, height: 1, arrayBufferView: pixels }
    });
    this.styleDirty = false;
  }

  private rebuildCommands(): void {
    if (!this.context) return;
    this.destroyCommands();
    if (this.options.showHorizontal) this.commands.push(this.createCommand(0));
    if (this.options.showVertical) {
      this.commands.push(this.createCommand(1));
      this.commands.push(this.createCommand(2));
    }
    if (this.crossSection) this.commands.push(this.createCommand(3));
    this.geometryDirty = false;
  }

  private createCommand(orientation: SliceOrientation): any {
    const geometry =
      orientation === 0
        ? this.createHorizontalGeometry()
        : this.createVerticalGeometry(orientation);
    const vertexArray = Renderer.VertexArray.fromGeometry({
      context: this.context,
      geometry,
      attributeLocations: { st: 0, a_height: 1, a_lonLat: 2, a_volumePosition: 3 },
      bufferUsage: Renderer.BufferUsage.STATIC_DRAW
    });
    const shaderProgram = Renderer.ShaderProgram.fromCache({
      context: this.context,
      attributeLocations: { st: 0, a_height: 1, a_lonLat: 2, a_volumePosition: 3 },
      vertexShaderSource: cubeVertexShaderSource,
      fragmentShaderSource: cubeFragmentShaderSource
    });
    const maximumElevation = this.elevationValues.length ? Math.max(...this.elevationValues) : 0;
    const uniformMap = {
      u_orientation: () => orientation,
      u_bounds: () =>
        new Cesium.Cartesian4(
          this.options.bounds.west,
          this.options.bounds.south,
          this.options.bounds.east,
          this.options.bounds.north
        ),
      u_slice: () =>
        new Cesium.Cartesian3(this.slices.latitude, this.slices.longitude, this.slices.elevation),
      u_horizontalHeight: () => {
        const [, , nz] = this.options.dimensions;
        const dataIndex = Math.round(this.slices.elevation * Math.max(nz - 1, 0));
        const placementIndex = this.options.flipElevation ? nz - 1 - dataIndex : dataIndex;
        return this.elevationHeight(this.elevationValues[placementIndex] ?? 0, maximumElevation);
      },
      u_latAscending: () => (this.options.latIsAscending ? 1 : 0),
      u_flipElevation: () => (this.options.flipElevation ? 1 : 0),
      u_projectedCrs: () => (this.options.projectedCrs ? 1 : 0),
      u_crossSection: () => {
        const section = this.crossSection;
        return new Cesium.Cartesian4(
          section?.start[0] ?? 0,
          section?.start[1] ?? 0,
          section?.end[0] ?? 0,
          section?.end[1] ?? 0
        );
      },
      u_warpedGeometry: () => (this.isWarped ? 1 : 0),
      u_volume: () => this.volumeTexture,
      u_colormap: () => this.colormapTexture,
      u_dimensions: () => new Cesium.Cartesian3(...this.options.dimensions),
      u_colorRange: () => new Cesium.Cartesian2(this.options.colorMin, this.options.colorMax),
      u_transform: () => new Cesium.Cartesian2(this.options.scaleFactor, this.options.addOffset),
      u_opacity: () => this.options.opacity,
      u_useFill: () => (this.options.useFillValue ? 1 : 0),
      u_fillValue: () => this.options.fillValue ?? 0,
      u_hasNoDataMin: () => (this.options.noDataMin === undefined ? 0 : 1),
      u_noDataMin: () => this.options.noDataMin ?? 0,
      u_hasNoDataMax: () => (this.options.noDataMax === undefined ? 0 : 1),
      u_noDataMax: () => this.options.noDataMax ?? 0
    };
    const opaque = this.options.opacity >= 1;
    return new Renderer.DrawCommand({
      owner: this,
      vertexArray,
      primitiveType: Renderer.PrimitiveType.TRIANGLES,
      uniformMap,
      shaderProgram,
      renderState: Renderer.RenderState.fromCache({
        depthTest: { enabled: true },
        depthMask: opaque,
        cull: { enabled: false },
        blending: opaque ? undefined : Renderer.BlendingState.ALPHA_BLEND
      }),
      pass: opaque ? Renderer.Pass.OPAQUE : Renderer.Pass.TRANSLUCENT,
      boundingVolume: geometry.boundingSphere
    });
  }

  private createHorizontalGeometry(): any {
    if (this.isWarped) {
      return this.createWarpedGridGeometry(64, 64, (u, v) => ({
        lonLat: this.geographicAtDataFraction(u, this.options.latIsAscending ? v : 1 - v),
        volume: [u, this.options.latIsAscending ? v : 1 - v, this.slices.elevation],
        height: 0
      }));
    }
    return this.createGridGeometry(32, 32, () => 0);
  }

  private createVerticalGeometry(_orientation: 1 | 2 | 3): any {
    const [nx, ny, nz] = this.options.dimensions;
    const horizontalSize = _orientation === 1 ? nx : _orientation === 2 ? ny : 257;
    const horizontalSegments = Math.max(1, Math.min(horizontalSize - 1, 256));
    const maximumElevation = this.elevationValues.length ? Math.max(...this.elevationValues) : 0;
    const verticalSegments = Math.max(nz - 1, 1);
    if (this.isWarped) {
      return this.createWarpedGridGeometry(horizontalSegments, verticalSegments, (u, v) => {
        const dataElevation = this.options.flipElevation ? 1 - v : v;
        const elevationIndex = Math.round(v * Math.max(nz - 1, 0));
        const height = this.elevationHeight(
          this.elevationValues[elevationIndex] ?? 0,
          maximumElevation
        );
        if (_orientation === 1) {
          return {
            lonLat: this.geographicAtDataFraction(u, this.slices.latitude),
            volume: [u, this.slices.latitude, dataElevation],
            height
          };
        }
        if (_orientation === 2) {
          const dataLatitude = this.options.latIsAscending ? u : 1 - u;
          return {
            lonLat: this.geographicAtDataFraction(this.slices.longitude, dataLatitude),
            volume: [this.slices.longitude, dataLatitude, dataElevation],
            height
          };
        }
        const lonLat = this.interpolateCrossSection(u);
        const [sourceX, sourceY] = this.options.projection!.forward(lonLat);
        return {
          lonLat,
          volume: [
            this.coordinateFraction(this.sourceX, sourceX),
            this.coordinateFraction(this.sourceY, sourceY),
            dataElevation
          ],
          height
        };
      });
    }
    return this.createGridGeometry(horizontalSegments, verticalSegments, (_x, y) => {
      const index = Math.round(y * Math.max(nz - 1, 0));
      return this.elevationHeight(this.elevationValues[index] ?? 0, maximumElevation);
    });
  }

  private createGridGeometry(
    horizontalSegments: number,
    verticalSegments: number,
    heightAt: (x: number, y: number) => number
  ): any {
    const sts: number[] = [];
    const heights: number[] = [];
    const indices: number[] = [];
    for (let y = 0; y <= verticalSegments; y++) {
      const v = verticalSegments === 0 ? 0 : y / verticalSegments;
      for (let x = 0; x <= horizontalSegments; x++) {
        const u = horizontalSegments === 0 ? 0 : x / horizontalSegments;
        sts.push(u, v);
        heights.push(heightAt(u, v));
      }
    }
    const row = horizontalSegments + 1;
    for (let y = 0; y < verticalSegments; y++) {
      for (let x = 0; x < horizontalSegments; x++) {
        const lowerLeft = y * row + x;
        indices.push(lowerLeft, lowerLeft + 1, lowerLeft + row);
        indices.push(lowerLeft + 1, lowerLeft + row + 1, lowerLeft + row);
      }
    }
    const indexArray = sts.length / 2 > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
    const center = Cesium.Cartesian3.fromDegrees(
      (this.options.bounds.west + this.options.bounds.east) / 2,
      (this.options.bounds.south + this.options.bounds.north) / 2,
      0
    );
    return new Renderer.Geometry({
      attributes: {
        st: new Renderer.GeometryAttribute({
          componentDatatype: Renderer.ComponentDatatype.FLOAT,
          componentsPerAttribute: 2,
          values: new Float32Array(sts)
        }),
        a_height: new Renderer.GeometryAttribute({
          componentDatatype: Renderer.ComponentDatatype.FLOAT,
          componentsPerAttribute: 1,
          values: new Float32Array(heights)
        }),
        a_lonLat: new Renderer.GeometryAttribute({
          componentDatatype: Renderer.ComponentDatatype.FLOAT,
          componentsPerAttribute: 2,
          values: new Float32Array(sts.length)
        }),
        a_volumePosition: new Renderer.GeometryAttribute({
          componentDatatype: Renderer.ComponentDatatype.FLOAT,
          componentsPerAttribute: 3,
          values: new Float32Array(sts.length / 2 * 3)
        })
      },
      indices: indexArray,
      primitiveType: Renderer.PrimitiveType.TRIANGLES,
      boundingSphere: new Cesium.BoundingSphere(center, Cesium.Ellipsoid.WGS84.maximumRadius * 2)
    });
  }

  private get isWarped(): boolean {
    const code = this.options.projection?.code;
    return Boolean(code && code !== 'EPSG:4326' && code !== 'EPSG:3857');
  }

  private get sourceX(): number[] {
    return Array.from(this.options.dimensionX ?? [], Number);
  }

  private get sourceY(): number[] {
    return Array.from(this.options.dimensionY ?? [], Number);
  }

  private coordinateAtFraction(values: number[], fraction: number): number {
    if (!values.length) throw new Error('Projected cube coordinates are unavailable');
    const position = Math.max(0, Math.min(values.length - 1, fraction * (values.length - 1)));
    const lower = Math.floor(position);
    const upper = Math.min(values.length - 1, lower + 1);
    return values[lower] + (position - lower) * (values[upper] - values[lower]);
  }

  private coordinateFraction(values: number[], target: number): number {
    if (values.length <= 1) return 0;
    const ascending = values[values.length - 1] >= values[0];
    if (target <= Math.min(values[0], values[values.length - 1])) return ascending ? 0 : 1;
    if (target >= Math.max(values[0], values[values.length - 1])) return ascending ? 1 : 0;
    let lower = 0;
    let upper = values.length - 1;
    while (upper - lower > 1) {
      const middle = (lower + upper) >> 1;
      if ((values[middle] <= target) === ascending) lower = middle;
      else upper = middle;
    }
    const span = values[upper] - values[lower];
    return (lower + (span === 0 ? 0 : (target - values[lower]) / span)) /
      (values.length - 1);
  }

  private geographicAtDataFraction(xFraction: number, yFraction: number): [number, number] {
    const x = this.coordinateAtFraction(this.sourceX, xFraction);
    const y = this.coordinateAtFraction(this.sourceY, yFraction);
    return this.options.projection!.inverse([x, y]);
  }

  private interpolateCrossSection(fraction: number): [number, number] {
    const section = this.crossSection!;
    const start = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.fromDegrees(section.start[0], section.start[1]),
      new Cesium.Cartesian3()
    );
    const end = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.fromDegrees(section.end[0], section.end[1]),
      new Cesium.Cartesian3()
    );
    const angle = Cesium.Cartesian3.angleBetween(start, end);
    if (angle < 1e-8) return [...section.start];
    const denominator = Math.sin(angle);
    const point = Cesium.Cartesian3.add(
      Cesium.Cartesian3.multiplyByScalar(start, Math.sin((1 - fraction) * angle) / denominator, new Cesium.Cartesian3()),
      Cesium.Cartesian3.multiplyByScalar(end, Math.sin(fraction * angle) / denominator, new Cesium.Cartesian3()),
      new Cesium.Cartesian3()
    );
    Cesium.Cartesian3.normalize(point, point);
    return [
      Cesium.Math.toDegrees(Math.atan2(point.y, point.x)),
      Cesium.Math.toDegrees(Math.asin(Math.max(-1, Math.min(1, point.z))))
    ];
  }

  private createWarpedGridGeometry(
    horizontalSegments: number,
    verticalSegments: number,
    vertexAt: (u: number, v: number) => {
      lonLat: [number, number];
      volume: [number, number, number];
      height: number;
    }
  ): any {
    const sts: number[] = [];
    const heights: number[] = [];
    const lonLats: number[] = [];
    const volumePositions: number[] = [];
    const cartesianPositions: Cesium.Cartesian3[] = [];
    const indices: number[] = [];
    for (let y = 0; y <= verticalSegments; y++) {
      const v = y / verticalSegments;
      for (let x = 0; x <= horizontalSegments; x++) {
        const u = x / horizontalSegments;
        const vertex = vertexAt(u, v);
        sts.push(u, v);
        heights.push(vertex.height);
        lonLats.push(...vertex.lonLat);
        volumePositions.push(...vertex.volume);
        cartesianPositions.push(Cesium.Cartesian3.fromDegrees(...vertex.lonLat, vertex.height));
      }
    }
    const row = horizontalSegments + 1;
    for (let y = 0; y < verticalSegments; y++) {
      for (let x = 0; x < horizontalSegments; x++) {
        const lowerLeft = y * row + x;
        indices.push(lowerLeft, lowerLeft + 1, lowerLeft + row);
        indices.push(lowerLeft + 1, lowerLeft + row + 1, lowerLeft + row);
      }
    }
    const indexArray = sts.length / 2 > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
    return new Renderer.Geometry({
      attributes: {
        st: new Renderer.GeometryAttribute({
          componentDatatype: Renderer.ComponentDatatype.FLOAT,
          componentsPerAttribute: 2,
          values: new Float32Array(sts)
        }),
        a_height: new Renderer.GeometryAttribute({
          componentDatatype: Renderer.ComponentDatatype.FLOAT,
          componentsPerAttribute: 1,
          values: new Float32Array(heights)
        }),
        a_lonLat: new Renderer.GeometryAttribute({
          componentDatatype: Renderer.ComponentDatatype.FLOAT,
          componentsPerAttribute: 2,
          values: new Float32Array(lonLats)
        }),
        a_volumePosition: new Renderer.GeometryAttribute({
          componentDatatype: Renderer.ComponentDatatype.FLOAT,
          componentsPerAttribute: 3,
          values: new Float32Array(volumePositions)
        })
      },
      indices: indexArray,
      primitiveType: Renderer.PrimitiveType.TRIANGLES,
      boundingSphere: Cesium.BoundingSphere.fromPoints(cartesianPositions)
    });
  }

  private elevationHeight(value: number, maximum: number): number {
    return this.options.elevationMode === 'depth'
      ? (value - maximum) * this.options.verticalExaggeration
      : value * this.options.verticalExaggeration;
  }

  private destroyCommands(): void {
    for (const command of this.commands) {
      this.destroyResource(command.vertexArray);
      this.destroyResource(command.shaderProgram);
    }
    this.commands = [];
  }

  private destroyResource(resource: any): void {
    if (resource && (!resource.isDestroyed || !resource.isDestroyed())) resource.destroy?.();
  }
}
