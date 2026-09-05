import {describe, expect, it} from 'vitest';
import {
  GIVE_UP_AFTER_MS,
  ScanError,
  hasWaitedLongEnough,
  isFinished,
  isWorthRetrying,
  jobsAhead,
  nextPollDelay,
  outcomeOf,
  progressMessageKey,
  scanErrorMessageKey,
} from './recipeScanJob';

const error = (code: string, retryable = false): ScanError => ({code, message: 'x', retryable});

describe('knowing when a scan is over', () => {
  it.each(['COMPLETED', 'FAILED', 'CANCELLED'] as const)('%s is finished', (status) => {
    expect(isFinished(status)).toBe(true);
  });

  it.each(['QUEUED', 'PROCESSING'] as const)('%s is not finished', (status) => {
    expect(isFinished(status)).toBe(false);
  });
});

describe('how often to ask', () => {
  it('asks quickly the first time', () => {
    expect(nextPollDelay(0)).toBeLessThanOrEqual(1000);
  });

  it('backs off so a slow scan does not cost a request a second', () => {
    expect(nextPollDelay(3)).toBeGreaterThan(nextPollDelay(0));
  });

  it('never waits longer than a few seconds', () => {
    expect(nextPollDelay(50)).toBeLessThanOrEqual(4000);
  });

  it('treats a nonsensical attempt count as the first', () => {
    expect(nextPollDelay(-5)).toBe(nextPollDelay(0));
  });

  it('gives up eventually', () => {
    expect(hasWaitedLongEnough(GIVE_UP_AFTER_MS)).toBe(true);
    expect(hasWaitedLongEnough(GIVE_UP_AFTER_MS - 1)).toBe(false);
  });
});

describe('explaining a failure', () => {
  it.each([
    ['USER_QUOTA_EXCEEDED', 'screens.recipeScan.errors.dailyLimit'],
    ['TOO_MANY_IN_FLIGHT', 'screens.recipeScan.errors.busy'],
    ['ML_UNREACHABLE', 'screens.recipeScan.errors.unavailable'],
    ['TOKEN_REVOKED', 'screens.recipeScan.errors.unavailable'],
    ['ATTACHMENT_TOO_LARGE', 'screens.recipeScan.errors.imageTooLarge'],
    ['OCR_NO_TEXT_FOUND', 'screens.recipeScan.errors.noTextFound'],
    ['ML_TIMEOUT', 'screens.recipeScan.errors.timedOut'],
  ])('%s is explained in the app rather than in the server log', (code, key) => {
    expect(scanErrorMessageKey(error(code))).toBe(key);
  });

  it('falls back to something generic for a code it has never seen', () => {
    expect(scanErrorMessageKey(error('SOMETHING_NEW'))).toBe('common.unknownerror');
  });

  it('falls back when there is no error at all', () => {
    expect(scanErrorMessageKey(undefined)).toBe('common.unknownerror');
  });
});

describe('offering to try again', () => {
  it('does for something that might work next time', () => {
    expect(isWorthRetrying(error('ML_UNREACHABLE', true))).toBe(true);
  });

  it('does not for a picture that will never read any better', () => {
    expect(isWorthRetrying(error('OCR_NO_TEXT_FOUND', false))).toBe(false);
  });

  it('does not when the allowance is spent, however retryable that is in principle', () => {
    // Trying again today can only fail again, and would spend nothing but the person's patience.
    expect(isWorthRetrying(error('USER_QUOTA_EXCEEDED', true))).toBe(false);
  });
});

describe('what to say while waiting', () => {
  it('distinguishes queued from being read', () => {
    expect(progressMessageKey('QUEUED')).toBe('screens.recipeScan.waiting');
    expect(progressMessageKey('PROCESSING')).toBe('screens.recipeScan.reading');
  });
});

describe('telling somebody how long they are waiting', () => {
  it('says nothing while the scan is being read', () => {
    expect(jobsAhead('PROCESSING', 4)).toBeUndefined();
  });

  it('says nothing when the scan is next in line', () => {
    // "0 scans ahead of you" is worse than saying nothing.
    expect(jobsAhead('QUEUED', 1)).toBeUndefined();
  });

  it('counts the scans actually ahead of this one', () => {
    expect(jobsAhead('QUEUED', 4)).toBe(3);
  });

  it('says nothing when the server did not tell us', () => {
    expect(jobsAhead('QUEUED', undefined)).toBeUndefined();
    expect(jobsAhead('QUEUED', null)).toBeUndefined();
  });
});

describe('outcomeOf', () => {
  const job = (over: Partial<Parameters<typeof outcomeOf>[0]> = {}) => ({
    status: 'COMPLETED' as const, recipe: {title: 'Apfelkuchen'}, ...over,
  });

  it('keeps waiting while the scan is unfinished', () => {
    expect(outcomeOf(job({status: 'QUEUED'})).next).toBe('keepWaiting');
    expect(outcomeOf(job({status: 'PROCESSING'})).next).toBe('keepWaiting');
  });

  it('moves on to the questions once a recipe has been read', () => {
    expect(outcomeOf(job()).next).toBe('confirm');
  });

  it('gives up with the reason when the photo could not be read', () => {
    // Ahead of the recipe: something is always read, and offering four words as
    // a recipe hides that the photograph was the problem.
    const outcome = outcomeOf(job({photo: {usable: false, problem: 'sideways'}}));

    expect(outcome).toEqual({
      next: 'giveUp',
      // Not retryable: the same picture would fail the same way, and taking another one
      // starts the scan anyway.
      failure: {messageKey: 'screens.recipeScan.photo.sideways', retryable: false},
    });
  });

  it('goes on to the questions when the photo was fine', () => {
    expect(outcomeOf(job({photo: {usable: true}})).next).toBe('confirm');
  });

  it('gives up with the failure when the scan failed', () => {
    const outcome = outcomeOf(job({
      status: 'FAILED',
      recipe: undefined,
      error: {code: 'OCR_NO_TEXT_FOUND', message: 'nothing', retryable: false},
    }));

    expect(outcome).toEqual({
      next: 'giveUp',
      failure: {messageKey: 'screens.recipeScan.errors.noTextFound', retryable: false},
    });
  });

  it('gives up when a finished scan somehow carries no recipe', () => {
    expect(outcomeOf(job({recipe: undefined})).next).toBe('giveUp');
  });

  it('gives up when the scan was cancelled', () => {
    expect(outcomeOf(job({status: 'CANCELLED', recipe: undefined})).next).toBe('giveUp');
  });
});
