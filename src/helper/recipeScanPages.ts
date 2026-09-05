/**
 * The photographs of one recipe and which of them is being edited.
 *
 * One reducer rather than two pieces of state, because the two have to agree: a page that is
 * moved, removed or replaced takes the selection with it.
 */

import {Crop, fullPageCrop, ScanPage} from './recipeScanCrop';
import {rotateCrop, Turn} from './recipeScanRotation';

export interface ScanPages {
  pages: ScanPage[];
  /** Index into `pages`, or -1 when there are none. */
  editing: number;
}

export const noPages: ScanPages = {pages: [], editing: -1};

export type ScanPagesAction =
  | {type: 'added'; uri: string}
  | {type: 'selected'; index: number}
  | {type: 'removed'; index: number}
  | {type: 'moved'; from: number; to: number}
  /** The crop of whichever page is being edited. */
  | {type: 'cropped'; crop: Crop}
  /** Keyed by uri rather than by index: it answers late, and by then the order may have moved. */
  | {type: 'detected'; uri: string; crop: Crop}
  | {type: 'turned'; uri: string; turnedUri: string; turn: Turn};

export const scanPagesReducer = (state: ScanPages, action: ScanPagesAction): ScanPages => {
  switch (action.type) {
    case 'added': {
      const pages = [...state.pages, {uri: action.uri, crop: fullPageCrop()}];
      return {pages, editing: pages.length - 1};
    }

    case 'selected':
      return action.index >= 0 && action.index < state.pages.length ?
        {...state, editing: action.index} :
        state;

    case 'removed': {
      if (!inRange(action.index, state.pages)) {
        return state;
      }
      const pages = state.pages.filter((_, index) => index !== action.index);
      // Follows the page that was being edited where it can, and otherwise stays where it is
      // rather than jumping back to the first page.
      const editing = action.index < state.editing ? state.editing - 1 : state.editing;
      return {pages, editing: Math.min(editing, pages.length - 1)};
    }

    case 'moved': {
      if (!inRange(action.from, state.pages) || !inRange(action.to, state.pages)) {
        return state;
      }
      const selected = state.pages[state.editing];
      const pages = [...state.pages];
      const [moved] = pages.splice(action.from, 1);
      pages.splice(action.to, 0, moved);
      return {pages, editing: pages.indexOf(selected)};
    }

    case 'cropped':
      return mapPage(state, (_, index) => index === state.editing,
          (page) => ({...page, crop: action.crop}));

    case 'detected':
      return mapPage(state, (page) => page.uri === action.uri,
          (page) => ({...page, crop: action.crop}));

    case 'turned':
      return mapPage(state, (page) => page.uri === action.uri,
          (page) => ({uri: action.turnedUri, crop: rotateCrop(page.crop, action.turn)}));
  }
};

// The page being edited, or undefined when there are none.
export const editedPage = (state: ScanPages): ScanPage | undefined => state.pages[state.editing];

const inRange = (index: number, pages: ScanPage[]) => index >= 0 && index < pages.length;

const mapPage = (
    state: ScanPages,
    matches: (page: ScanPage, index: number) => boolean,
    replace: (page: ScanPage) => ScanPage,
): ScanPages => ({
  ...state,
  pages: state.pages.map((page, index) => matches(page, index) ? replace(page) : page),
});
