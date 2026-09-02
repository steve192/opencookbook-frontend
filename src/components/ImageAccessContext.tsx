import React, {createContext, ReactNode, useContext} from 'react';

/**
 * How the images below this point in the tree are reached.
 *
 * A shared recipe is read without a token, and its images have to be read the same way - through
 * the share rather than as their owner. That is a property of the screen, not of any one image,
 * so it is provided rather than threaded through every component that happens to sit in between.
 */
const ImageAccessContext = createContext<string | undefined>(undefined);

/**
 * Marks a subtree as showing a shared recipe.
 *
 * @param {object} props the share the images belong to, and what is being shown
 * @return {JSX.Element} the subtree, with its images reachable
 */
export const SharedImageAccess = (props: {viaShare: string, children: ReactNode}) => (
  <ImageAccessContext.Provider value={props.viaShare}>{props.children}</ImageAccessContext.Provider>
);

/**
 * The share images here have to be read through, if any.
 *
 * @return {string | undefined} the share id, or undefined when the viewer owns the images
 */
export const useImageAccess = (): string | undefined => useContext(ImageAccessContext);
