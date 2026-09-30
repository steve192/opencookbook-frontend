import {Recipe} from './recipes';

/** One area of a photograph holding a kind of content, as fractions of the picture. */
export interface RecipeScanBlock {
  pageIndex: number;
  lineCount: number;
  box: {left: number; top: number; right: number; bottom: number};
}

/** Where the server thinks the page is in a photograph. */
export interface DetectedPage {
  /** Four corners as [x, y] fractions of the picture, clockwise from the top left. */
  corners: [number, number][];
  confidence: number;
  /** False when nothing convincing was found; the corners are then the whole frame. */
  detected: boolean;
}

/** What the server says about a recipe being read from photographs. */
export interface RecipeScanJob {
  id: string;
  jobType: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  /** The recipe that was read, once it is done. Not saved anywhere until somebody says so. */
  recipe?: Recipe;
  /** Where each kind of content was found. Either half may be null: none found is an answer. */
  blocks?: {
    ingredients?: RecipeScanBlock[] | null;
    steps?: RecipeScanBlock[] | null;
  };
  /**
   * What is wrong with the photograph. Beside the recipe rather than instead of it: a page that
   * could not be read is still read as far as it goes.
   */
  photo?: {usable: boolean; problem?: string | null; pageIndex?: number | null};
  /** How many scans are ahead of this one, while it is still waiting. */
  queuePosition?: number | null;
  error?: {code: string; retryable: boolean};
}
