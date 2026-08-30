import {describe, expect, it} from 'vitest';
import type {RecipeImage} from '../dao/RestAPI';
import {TITLE_IMAGE_INDEX, moveImage} from './recipeImages';

const images = (...uuids: string[]): RecipeImage[] => uuids.map((uuid) => ({uuid}));
const uuids = (list: RecipeImage[]) => list.map((image) => image.uuid);

describe('moveImage', () => {
  it('moves an image towards the front', () => {
    expect(uuids(moveImage(images('a', 'b', 'c'), 2, -1))).toEqual(['a', 'c', 'b']);
  });

  it('moves an image towards the back', () => {
    expect(uuids(moveImage(images('a', 'b', 'c'), 0, 1))).toEqual(['b', 'a', 'c']);
  });

  it('makes an image the title image when moved to the front', () => {
    const reordered = moveImage(images('a', 'b'), 1, -1);

    expect(reordered[TITLE_IMAGE_INDEX].uuid).toBe('b');
  });

  it('moves across more than one position', () => {
    expect(uuids(moveImage(images('a', 'b', 'c', 'd'), 3, -3))).toEqual(['d', 'a', 'b', 'c']);
  });

  it('does nothing when moving the first image further to the front', () => {
    const original = images('a', 'b');

    expect(moveImage(original, 0, -1)).toBe(original);
  });

  it('does nothing when moving the last image further to the back', () => {
    const original = images('a', 'b');

    expect(moveImage(original, 1, 1)).toBe(original);
  });

  it('does nothing when the image is not in the list', () => {
    const original = images('a');

    expect(moveImage(original, 5, -1)).toBe(original);
    expect(moveImage([], 0, 1)).toEqual([]);
  });

  it('does nothing without an offset', () => {
    const original = images('a', 'b');

    expect(moveImage(original, 1, 0)).toBe(original);
  });

  it('does not mutate the given list', () => {
    const original = images('a', 'b', 'c');

    moveImage(original, 0, 2);

    expect(uuids(original)).toEqual(['a', 'b', 'c']);
  });
});
