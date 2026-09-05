import {describe, expect, it} from 'vitest';
import {photoProblem, photoProblemMessageKey} from './recipeScanPhoto';

describe('photoProblem', () => {
  it('says nothing when the photo was fine', () => {
    expect(photoProblem({usable: true})).toBeUndefined();
  });

  it('says nothing when the service did not report on the photo at all', () => {
    expect(photoProblem(undefined)).toBeUndefined();
  });

  it('reports a problem the app knows how to explain', () => {
    expect(photoProblem({usable: false, problem: 'sideways'})).toBe('sideways');
    expect(photoProblem({usable: false, problem: 'unreadable'})).toBe('unreadable');
  });

  it('ignores a problem this build has never heard of', () => {
    // Showing what was read beats showing a message nobody can act on.
    expect(photoProblem({usable: false, problem: 'quantum_decoherence'})).toBeUndefined();
  });

  it('has a message for every problem it reports', () => {
    (['sideways', 'unreadable', 'too_small'] as const).forEach((problem) => {
      expect(photoProblemMessageKey(problem)).toBe(`screens.recipeScan.photo.${problem}`);
    });
  });
});
