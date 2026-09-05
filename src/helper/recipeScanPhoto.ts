/** What to say when the photograph itself was the problem. */

/** The problems the service reports, and nothing else. An unknown one is treated as none. */
export type PhotoProblem = 'sideways' | 'unreadable' | 'too_small';

const PROBLEMS = new Set<PhotoProblem>(['sideways', 'unreadable', 'too_small']);

export const photoProblem = (
    photo?: {usable: boolean; problem?: string | null},
): PhotoProblem | undefined => {
  if (!photo || photo.usable) {
    return undefined;
  }
  const problem = photo.problem as PhotoProblem;
  return PROBLEMS.has(problem) ? problem : undefined;
};

/** A key the translation files are known to hold, so a typo is a compile error. */
export type PhotoMessageKey = `screens.recipeScan.photo.${PhotoProblem}`;

export const photoProblemMessageKey = (problem: PhotoProblem): PhotoMessageKey =>
  `screens.recipeScan.photo.${problem}`;
