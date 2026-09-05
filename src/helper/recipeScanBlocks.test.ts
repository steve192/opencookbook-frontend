import {describe, expect, it} from 'vitest';
import {
  areasOnPage,
  BlockAnswer,
  boxAround,
  buildCorrections,
  cropFromBox,
  hasCorrections,
  nextQuestion,
  pageForQuestion,
} from './recipeScanBlocks';
import {Crop} from './recipeScanCrop';

const quad = (...corners: [number, number][]): Crop =>
  corners.map(([x, y]) => ({x, y})) as Crop;

describe('turning a dragged shape into a rough area', () => {
  it('takes the box around the corners', () => {
    const dragged = quad([0.2, 0.1], [0.8, 0.15], [0.75, 0.9], [0.25, 0.85]);

    expect(boxAround(dragged)).toEqual({left: 0.2, top: 0.1, right: 0.8, bottom: 0.9});
  });

  it('round trips an area back into corners to start from', () => {
    const area = {left: 0.2, top: 0.1, right: 0.8, bottom: 0.9};

    expect(boxAround(cropFromBox(area))).toEqual(area);
  });

  it('starts from a sensible area when nothing was detected', () => {
    const box = boxAround(cropFromBox(undefined));

    expect(box.right).toBeGreaterThan(box.left);
    expect(box.bottom).toBeGreaterThan(box.top);
  });
});

describe('asking the questions', () => {
  it('asks about the ingredients first, because they are the harder half', () => {
    expect(nextQuestion([])).toBe('ingredients');
  });

  it('moves on once one is answered', () => {
    expect(nextQuestion([{kind: 'ingredients', answer: 'confirmed'}])).toBe('steps');
  });

  it('stops once both are answered', () => {
    const answers: BlockAnswer[] = [
      {kind: 'ingredients', answer: 'confirmed'},
      {kind: 'steps', answer: 'absent'},
    ];

    expect(nextQuestion(answers)).toBeUndefined();
  });

  it('asks about the page holding most of what was found', () => {
    const box = {left: 0, top: 0, right: 1, bottom: 1};

    expect(pageForQuestion([
      {pageIndex: 0, lineCount: 2, box},
      {pageIndex: 1, lineCount: 9, box},
    ])).toBe(1);
  });

  it('draws only the areas that are on the page being shown', () => {
    const box = {left: 0, top: 0, right: 1, bottom: 1};
    const blocks = [
      {pageIndex: 0, lineCount: 2, box},
      {pageIndex: 1, lineCount: 9, box},
    ];

    expect(areasOnPage(blocks, 1)).toHaveLength(1);
    expect(areasOnPage(blocks, 1)[0].lineCount).toBe(9);
    expect(areasOnPage(undefined, 0)).toEqual([]);
  });

  it('falls back to the first photograph for a block that was not found', () => {
    expect(pageForQuestion(null)).toBe(0);
    expect(pageForQuestion(undefined)).toBe(0);
    expect(pageForQuestion([])).toBe(0);
  });
});

describe('what gets sent back', () => {
  it('sends nothing for a confirmation', () => {
    // Agreeing is the same as not correcting; sending the area back could only round it.
    const answers: BlockAnswer[] = [{kind: 'ingredients', answer: 'confirmed'}];

    expect(buildCorrections(answers)).toEqual({});
    expect(hasCorrections(answers)).toBe(false);
  });

  it('sends a null for "there are none in the picture"', () => {
    expect(buildCorrections([{kind: 'steps', answer: 'absent'}])).toEqual({steps: null});
  });

  it('sends the area somebody marked', () => {
    const answers: BlockAnswer[] = [{
      kind: 'ingredients',
      answer: 'marked',
      areas: [{pageIndex: 1, box: {left: 0.1, top: 0.2, right: 0.5, bottom: 0.9}}],
    }];

    expect(buildCorrections(answers)).toEqual({
      ingredients: [{pageIndex: 1, box: [0.1, 0.2, 0.5, 0.9]}],
    });
  });

  it('sends every area when a list runs over two columns', () => {
    const answers: BlockAnswer[] = [{
      kind: 'ingredients',
      answer: 'marked',
      areas: [
        {pageIndex: 0, box: {left: 0.05, top: 0.2, right: 0.45, bottom: 0.9}},
        {pageIndex: 0, box: {left: 0.55, top: 0.2, right: 0.95, bottom: 0.6}},
      ],
    }];

    expect(buildCorrections(answers).ingredients).toHaveLength(2);
  });

  it('says nothing is worth sending when both were confirmed', () => {
    expect(hasCorrections([
      {kind: 'ingredients', answer: 'confirmed'},
      {kind: 'steps', answer: 'confirmed'},
    ])).toBe(false);
  });

  it('says there is something to send as soon as one was corrected', () => {
    expect(hasCorrections([
      {kind: 'ingredients', answer: 'confirmed'},
      {kind: 'steps', answer: 'absent'},
    ])).toBe(true);
  });
});
