import type {RecipeImage} from '../dao/RestAPI';

/** Position of the image that represents the recipe wherever a single image is shown. */
export const TITLE_IMAGE_INDEX = 0;

/**
 * Moves one image a number of positions through the list.
 *
 * The order carries meaning - whichever image ends up first is the recipe's title image -
 * so this returns a reordered copy and leaves the input untouched.
 *
 * @param {RecipeImage[]} images images in their current order
 * @param {number} index position of the image to move
 * @param {number} offset how far to move it, negative towards the front
 * @return {RecipeImage[]} reordered copy, or the given array itself when the move would
 *   leave the list bounds and there is nothing to do
 */
export const moveImage = (images: RecipeImage[], index: number, offset: number): RecipeImage[] => {
  const targetIndex = index + offset;
  const isOutsideList = (position: number) => position < 0 || position >= images.length;

  if (isOutsideList(index) || isOutsideList(targetIndex) || offset === 0) {
    return images;
  }

  const reordered = [...images];
  const [moved] = reordered.splice(index, 1);
  reordered.splice(targetIndex, 0, moved);
  return reordered;
};
