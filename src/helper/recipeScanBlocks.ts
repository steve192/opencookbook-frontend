/** The two questions asked after a recipe has been read. */

import {FractionBox} from './imageFit';
import {Crop} from './recipeScanCrop';

export type BlockKind = 'ingredients' | 'steps';

/** The order the questions are asked in. Ingredients first: they are the harder half. */
export const BLOCK_KINDS: BlockKind[] = ['ingredients', 'steps'];

/** A rectangle on one page, in fractions of the photograph that was sent. */
export type BlockBox = FractionBox;

/** Where the server thinks one kind of content is. */
export interface DetectedBlock {
  pageIndex: number;
  lineCount: number;
  box: BlockBox;
}

/** What the server said about both kinds. Null means it looked and found none. */
export interface DetectedBlocks {
  ingredients?: DetectedBlock[] | null;
  steps?: DetectedBlock[] | null;
}

/** An area somebody marked by hand. */
export interface MarkedArea {
  pageIndex: number;
  box: BlockBox;
}

export type BlockAnswer =
  | {kind: BlockKind; answer: 'confirmed'}
  | {kind: BlockKind; answer: 'absent'}
  | {kind: BlockKind; answer: 'marked'; areas: MarkedArea[]};

// Where marking starts when the server found nothing to start from.
const DEFAULT_MARK: BlockBox = {left: 0.1, top: 0.1, right: 0.9, bottom: 0.9};

// The smallest rectangle containing a dragged quadrilateral.
export const boxAround = (crop: Crop): BlockBox => {
  const xs = crop.map((corner) => corner.x);
  const ys = crop.map((corner) => corner.y);
  return {
    left: Math.min(...xs),
    top: Math.min(...ys),
    right: Math.max(...xs),
    bottom: Math.max(...ys),
  };
};

// Seeds the cropper, so marking an area starts from what was detected rather than from nothing.
export const cropFromBox = (box: BlockBox = DEFAULT_MARK): Crop => [
  {x: box.left, y: box.top},
  {x: box.right, y: box.top},
  {x: box.right, y: box.bottom},
  {x: box.left, y: box.bottom},
];

// Which question still needs asking, or undefined when both are done.
export const nextQuestion = (answers: BlockAnswer[]): BlockKind | undefined =>
  BLOCK_KINDS.find((kind) => !answers.some((answer) => answer.kind === kind));

// The answers as the server takes them. Confirming what it already found says nothing.
export const buildCorrections = (answers: BlockAnswer[]): Record<string, unknown> => {
  const corrections: Record<string, unknown> = {};
  answers.forEach((answer) => {
    if (answer.answer === 'absent') {
      corrections[answer.kind] = null;
    } else if (answer.answer === 'marked') {
      corrections[answer.kind] = answer.areas.map((area) => ({
        pageIndex: area.pageIndex,
        box: [area.box.left, area.box.top, area.box.right, area.box.bottom],
      }));
    }
  });
  return corrections;
};

// Whether the answers say anything the server does not already know.
export const hasCorrections = (answers: BlockAnswer[]): boolean =>
  Object.keys(buildCorrections(answers)).length > 0;

// The page a question is about: the one carrying most of what was found.
export const pageForQuestion = (blocks?: DetectedBlock[] | null): number => {
  if (!blocks?.length) {
    return 0;
  }
  const lines = new Map<number, number>();
  blocks.forEach((block) =>
    lines.set(block.pageIndex, (lines.get(block.pageIndex) ?? 0) + block.lineCount));
  return [...lines.entries()].sort((a, b) => b[1] - a[1])[0][0];
};

// The areas to draw over the page on screen.
export const areasOnPage = (
    blocks: DetectedBlock[] | null | undefined, pageIndex: number,
): DetectedBlock[] => (blocks ?? []).filter((block) => block.pageIndex === pageIndex);
