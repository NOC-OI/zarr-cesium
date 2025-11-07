import {
  interpolateRainbow,
  interpolateViridis,
  interpolateCool,
  interpolateWarm,
  interpolateInferno,
  interpolateMagma,
  interpolatePlasma,
  interpolateBlues,
  interpolateGreens,
  interpolateOranges,
  interpolateReds,
  interpolatePurples,
  interpolateBuGn,
  interpolateBuPu,
  interpolateCividis,
  interpolateCubehelixDefault,
  interpolateGnBu,
  interpolateGreys,
  interpolateOrRd,
  interpolatePuBu,
  interpolatePuBuGn,
  interpolatePuRd,
  interpolateRdPu,
  interpolateSinebow,
  interpolateTurbo,
  interpolateYlGn,
  interpolateYlGnBu,
  interpolateYlOrBr,
  interpolateYlOrRd,
} from 'd3-scale-chromatic';


const generateColorTable = (
  interpolator: (t: number) => string,
  reverse: boolean = false,
): string[] => {
  const segments = 20;
  const colors = Array.from({ length: segments }).map((_, i) => {
    return interpolator(i / (segments - 1));
  });
  if (reverse) {
    return colors.reverse();
  }
  return colors;
};

const generateSingleColorTable = (color: string): string[] => {
  return Array(20).fill(color);
};

export const colorSchemes = [
  { label: 'Single Color', value: 'single', interpolator: () => '#FFFFFF', isSingleColor: true },
  { label: 'Rainbow', value: 'rainbow', interpolator: interpolateRainbow },
  { label: 'Turbo', value: 'turbo', interpolator: interpolateTurbo },
  { label: 'Viridis', value: 'viridis', interpolator: interpolateViridis },
  { label: 'Cool', value: 'cool', interpolator: interpolateCool },
  { label: 'Warm', value: 'warm', interpolator: interpolateWarm },
  { label: 'Inferno', value: 'inferno', interpolator: interpolateInferno },
  { label: 'Magma', value: 'magma', interpolator: interpolateMagma },
  { label: 'Plasma', value: 'plasma', interpolator: interpolatePlasma },
  { label: 'Cividis', value: 'cividis', interpolator: interpolateCividis },
  { label: 'Cubehelix', value: 'cubehelix', interpolator: interpolateCubehelixDefault },
  { label: 'Sinebow', value: 'sinebow', interpolator: interpolateSinebow },
  { label: 'Blues', value: 'blues', interpolator: interpolateBlues },
  { label: 'Greens', value: 'greens', interpolator: interpolateGreens },
  { label: 'Greys', value: 'greys', interpolator: interpolateGreys },
  { label: 'Oranges', value: 'oranges', interpolator: interpolateOranges },
  { label: 'Purples', value: 'purples', interpolator: interpolatePurples },
  { label: 'Reds', value: 'reds', interpolator: interpolateReds },
  { label: 'BuGn', value: 'bugn', interpolator: interpolateBuGn },
  { label: 'BuPu', value: 'bupu', interpolator: interpolateBuPu },
  { label: 'GnBu', value: 'gnbu', interpolator: interpolateGnBu },
  { label: 'OrRd', value: 'orrd', interpolator: interpolateOrRd },
  { label: 'PuBuGn', value: 'pubugn', interpolator: interpolatePuBuGn },
  { label: 'PuBu', value: 'pubu', interpolator: interpolatePuBu },
  { label: 'PuRd', value: 'purd', interpolator: interpolatePuRd },
  { label: 'RdPu', value: 'rdpu', interpolator: interpolateRdPu },
  { label: 'YlGnBu', value: 'ylgnbu', interpolator: interpolateYlGnBu },
  { label: 'YlGn', value: 'ylgn', interpolator: interpolateYlGn },
  { label: 'YlOrBr', value: 'ylorbr', interpolator: interpolateYlOrBr },
  { label: 'YlOrRd', value: 'ylorrd', interpolator: interpolateYlOrRd }
].map((item) => ({
  ...item,
  colors: item.isSingleColor
    ? generateSingleColorTable(item.interpolator())
    : generateColorTable(item.interpolator),
}));
