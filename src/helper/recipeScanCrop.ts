/** The geometry behind cropping a photographed recipe, kept away from anything that renders. */

/** A corner of the region to read, as a fraction of the picture's width and height. */
export interface CropCorner {
  x: number;
  y: number;
}

/** Four corners, in the order the server expects: top left, top right, bottom right, bottom left. */
export type Crop = [CropCorner, CropCorner, CropCorner, CropCorner];

/** Starts just inside the edges, so every handle is visible and grabbable straight away. */
const DEFAULT_INSET = 0.06;

/** Below this the crop is a smudge rather than a page, and the server would ignore it anyway. */
const MIN_SIDE = 0.1;

export const fullPageCrop = (): Crop => [
  {x: DEFAULT_INSET, y: DEFAULT_INSET},
  {x: 1 - DEFAULT_INSET, y: DEFAULT_INSET},
  {x: 1 - DEFAULT_INSET, y: 1 - DEFAULT_INSET},
  {x: DEFAULT_INSET, y: 1 - DEFAULT_INSET},
];

// The corners the server found, or the whole page when it found nothing convincing.
export const cropFromDetection = (
    detection?: {corners: [number, number][]; detected: boolean},
): Crop => {
  if (!detection?.detected || detection.corners?.length !== 4) {
    return fullPageCrop();
  }
  return orderCorners(detection.corners.map(([x, y]) => clampCorner({x, y})));
};

export const clampCorner = (corner: CropCorner): CropCorner => ({
  x: Math.min(1, Math.max(0, corner.x)),
  y: Math.min(1, Math.max(0, corner.y)),
});

// Puts four corners into the order the server reads them in: clockwise from the top left.
export const orderCorners = (corners: CropCorner[]): Crop => {
  // The top left corner has the smallest x+y and the bottom right the largest; the other two are
  // separated by the sign of y-x.
  const sums = corners.map((corner) => corner.x + corner.y);
  const differences = corners.map((corner) => corner.y - corner.x);

  return [
    corners[indexOfExtreme(sums, 'lowest')],
    corners[indexOfExtreme(differences, 'lowest')],
    corners[indexOfExtreme(sums, 'highest')],
    corners[indexOfExtreme(differences, 'highest')],
  ];
};

const indexOfExtreme = (values: number[], pick: 'lowest' | 'highest'): number =>
  values.reduce((best, value, index) =>
    (pick === 'lowest' ? value < values[best] : value > values[best]) ? index : best, 0);

// Too little of the picture to be worth reading, so the crop is ignored rather than obeyed.
export const isTooSmall = (crop: Crop): boolean => {
  const xs = crop.map((corner) => corner.x);
  const ys = crop.map((corner) => corner.y);
  return Math.max(...xs) - Math.min(...xs) < MIN_SIDE ||
    Math.max(...ys) - Math.min(...ys) < MIN_SIDE;
};

// Still the whole picture, so there is nothing to send.
export const isUncropped = (crop: Crop): boolean => {
  const untouched = fullPageCrop();
  return crop.every((corner, index) =>
    Math.abs(corner.x - untouched[index].x) < 1e-6 &&
    Math.abs(corner.y - untouched[index].y) < 1e-6);
};

/** One photographed page, and the region of it worth reading. */
export interface ScanPage {
  /** Where the picture is, as the picker or camera handed it over. */
  uri: string;
  crop: Crop;
}

/**
 * Builds what the scan endpoint is told about the pages being sent.
 *
 * @param {ScanPage[]} pages the photographs, in the order they should be read
 * @param {string} [language] the language to read in, when one is worth hinting at
 * @return {string} the payload, as json
 */
export const buildScanPayload = (pages: ScanPage[], language?: string): string => {
  const payload: {pages: {crop?: number[][]}[], language?: string} = {
    pages: pages.map((page) =>
      isUncropped(page.crop) || isTooSmall(page.crop) ?
        {} :
        {crop: orderCorners(page.crop).map((corner) => [round(corner.x), round(corner.y)])}),
  };
  if (language) {
    payload.language = language;
  }
  return JSON.stringify(payload);
};

// Six decimal places is finer than any camera resolution the fraction is read against.
const round = (value: number) => Math.round(value * 1e6) / 1e6;
