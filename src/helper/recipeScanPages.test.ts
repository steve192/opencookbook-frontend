import {describe, expect, it} from 'vitest';
import {Crop, fullPageCrop, ScanPage} from './recipeScanCrop';
import {
  editedPage,
  noPages,
  ScanPages,
  ScanPagesAction,
  scanPagesReducer,
} from './recipeScanPages';

const withPages = (uris: string[], editing: number): ScanPages => ({
  pages: uris.map((uri): ScanPage => ({uri, crop: fullPageCrop()})),
  editing,
});

const after = (state: ScanPages, ...actions: ScanPagesAction[]): ScanPages =>
  actions.reduce(scanPagesReducer, state);

const uris = (state: ScanPages) => state.pages.map((page) => page.uri);

const crop = (...corners: [number, number][]): Crop =>
  corners.map(([x, y]) => ({x, y})) as Crop;

// A quarter turn is exact on paper but not in binary; the corners are fractions, so six places
// is far finer than any pixel they land on.
const round = (corner: {x: number; y: number}) =>
  ({x: Math.round(corner.x * 1e6) / 1e6, y: Math.round(corner.y * 1e6) / 1e6});

describe('adding pages', () => {
  it('starts with none and nothing selected', () => {
    expect(editedPage(noPages)).toBeUndefined();
  });

  it('selects each page as it is added, so it can be cropped straight away', () => {
    const state = after(noPages, {type: 'added', uri: 'one.jpg'}, {type: 'added', uri: 'two.jpg'});

    expect(uris(state)).toEqual(['one.jpg', 'two.jpg']);
    expect(editedPage(state)?.uri).toBe('two.jpg');
  });
});

describe('removing a page', () => {
  it('keeps the rest in order', () => {
    const state = after(withPages(['a', 'b', 'c'], 0), {type: 'removed', index: 1});

    expect(uris(state)).toEqual(['a', 'c']);
  });

  it('stays on the page being edited when an earlier one goes', () => {
    const state = after(withPages(['a', 'b', 'c'], 2), {type: 'removed', index: 0});

    expect(editedPage(state)?.uri).toBe('c');
  });

  it('stays where it is when the page being edited goes', () => {
    const state = after(withPages(['a', 'b', 'c'], 1), {type: 'removed', index: 1});

    expect(editedPage(state)?.uri).toBe('c');
  });

  it('falls back to the last page when the one being edited was the last', () => {
    const state = after(withPages(['a', 'b'], 1), {type: 'removed', index: 1});

    expect(editedPage(state)?.uri).toBe('a');
  });

  it('selects nothing once the last page has gone', () => {
    const state = after(withPages(['a'], 0), {type: 'removed', index: 0});

    expect(state.pages).toEqual([]);
    expect(editedPage(state)).toBeUndefined();
  });

  it('ignores a page that is not there', () => {
    const state = withPages(['a'], 0);

    expect(after(state, {type: 'removed', index: 4})).toBe(state);
  });
});

describe('moving a page', () => {
  it('reorders them, because their order is the recipe order', () => {
    const state = after(withPages(['a', 'b', 'c'], 0), {type: 'moved', from: 2, to: 0});

    expect(uris(state)).toEqual(['c', 'a', 'b']);
  });

  it('keeps the selection on the page that moved, not on its old slot', () => {
    const state = after(withPages(['a', 'b', 'c'], 2), {type: 'moved', from: 2, to: 0});

    expect(editedPage(state)?.uri).toBe('c');
  });

  it('keeps the selection on a page another one was moved past', () => {
    const state = after(withPages(['a', 'b', 'c'], 0), {type: 'moved', from: 2, to: 0});

    expect(editedPage(state)?.uri).toBe('a');
  });

  it('leaves the pages alone when a move goes nowhere', () => {
    const state = withPages(['a', 'b', 'c'], 0);

    expect(after(state, {type: 'moved', from: 0, to: 9})).toBe(state);
    expect(after(state, {type: 'moved', from: -1, to: 0})).toBe(state);
  });
});

describe('selecting a page', () => {
  it('changes which one is edited', () => {
    expect(editedPage(after(withPages(['a', 'b'], 0), {type: 'selected', index: 1}))?.uri)
        .toBe('b');
  });

  it('ignores an index that is not a page', () => {
    const state = withPages(['a'], 0);

    expect(after(state, {type: 'selected', index: 3})).toBe(state);
  });
});

describe('changing a crop', () => {
  const corners = fullPageCrop().map((corner) => ({x: corner.x / 2, y: corner.y}));
  const tighter = corners as ReturnType<typeof fullPageCrop>;

  it('applies to the page being edited', () => {
    const state = after(withPages(['a', 'b'], 1), {type: 'cropped', crop: tighter});

    expect(state.pages[1].crop).toEqual(tighter);
    expect(state.pages[0].crop).toEqual(fullPageCrop());
  });

  // Edge detection answers after the picture was added, by which time the pages may have been
  // reordered - so it names the page it was asked about rather than a position.
  it('applies a detected crop to the page it was detected on, wherever it now sits', () => {
    const state = after(withPages(['a', 'b'], 0),
        {type: 'moved', from: 0, to: 1},
        {type: 'detected', uri: 'a', crop: tighter});

    expect(state.pages[1].crop).toEqual(tighter);
  });

  it('ignores a detection for a page that has since gone', () => {
    const state = after(withPages(['a'], 0), {type: 'detected', uri: 'gone.jpg', crop: tighter});

    expect(state.pages[0].crop).toEqual(fullPageCrop());
  });
});

describe('turning a page', () => {
  // The rewritten file arrives after the turn was asked for, and by then somebody may have
  // selected another page - which must not be given the picture that was turned.
  it('replaces the page that was turned, not whichever is selected now', () => {
    const state = after(withPages(['a', 'b'], 0),
        {type: 'selected', index: 1},
        {type: 'turned', uri: 'a', turnedUri: 'a-turned', turn: 'right'});

    expect(uris(state)).toEqual(['a-turned', 'b']);
  });

  it('turns the crop with the picture, so the corners are not lost', () => {
    // A band across the top of the page, which a quarter turn to the right puts down its side.
    const band = crop([0.1, 0.1], [0.9, 0.1], [0.9, 0.3], [0.1, 0.3]);

    const state = after({pages: [{uri: 'a', crop: band}], editing: 0},
        {type: 'turned', uri: 'a', turnedUri: 'a-turned', turn: 'right'});

    expect(state.pages[0].crop.map(round))
        .toEqual(crop([0.7, 0.1], [0.9, 0.1], [0.9, 0.9], [0.7, 0.9]));
  });
});
