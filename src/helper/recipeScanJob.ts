/** Waiting for a photographed recipe to be read, and saying what went wrong when it is not. */

import {ErrorMessageKey, messageKeyForCode} from './apiErrorMessage';
import {
  PhotoMessageKey,
  photoProblem,
  photoProblemMessageKey,
} from './recipeScanPhoto';

/** The states a scan moves through. Mirrors what the server calls them. */
export type ScanStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface ScanError {
  code: string;
  retryable: boolean;
}

/** The first question is asked quickly; a scan usually takes a few seconds. */
const FIRST_DELAY_MS = 800;
const GROWTH = 1.5;
/** Beyond this the app is just being impatient at somebody else's expense. */
const MAX_DELAY_MS = 4000;
/** After this the app stops waiting, whatever the server still thinks. */
export const GIVE_UP_AFTER_MS = 5 * 60 * 1000;

export const isFinished = (status: ScanStatus): boolean =>
  status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED';

export const nextPollDelay = (attempt: number): number =>
  Math.min(MAX_DELAY_MS, Math.round(FIRST_DELAY_MS * Math.pow(GROWTH, Math.max(0, attempt))));

export const hasWaitedLongEnough = (elapsedMs: number): boolean => elapsedMs >= GIVE_UP_AFTER_MS;

/**
 * Which message explains a scan that failed.
 *
 * A job failure names itself with the same codes a rejected request does, so there is one table
 * for both and nothing to keep in step.
 *
 * @param {ScanError} error what the scan failed with
 * @return {string} the key of the message to show
 */
export const scanErrorMessageKey = (error?: ScanError): ErrorMessageKey =>
  // A scan that failed without saying why is not the same as one whose answer never arrived.
  (error ? messageKeyForCode(error.code) : 'errors.unknown');

// Whether sending the very same photographs again could succeed.
export const isWorthRetrying = (error?: ScanError): boolean =>
  !error || (error.retryable && error.code !== 'SCAN_DAILY_LIMIT_REACHED');

export const progressMessageKey = (
    status: ScanStatus,
): 'screens.recipeScan.reading' | 'screens.recipeScan.waiting' =>
  status === 'PROCESSING' ?
    'screens.recipeScan.reading' :
    'screens.recipeScan.waiting';

// How many scans are ahead of this one, when that is worth showing at all.
export const jobsAhead = (
    status: ScanStatus, queuePosition?: number | null,
): number | undefined =>
  status !== 'QUEUED' || !queuePosition || queuePosition < 2 ? undefined : queuePosition - 1;

/** Everything the screen needs to explain a failure, however it came about. */
export interface ScanFailure {
  messageKey: PhotoMessageKey | ErrorMessageKey;
  /** Whether to offer "try again" rather than sending somebody back to the photographs. */
  retryable: boolean;
}

export const failureFromError = (error?: ScanError): ScanFailure => ({
  messageKey: scanErrorMessageKey(error),
  retryable: isWorthRetrying(error),
});

/** What the app should do once it has asked after a scan. */
export type ScanOutcome =
  | {next: 'keepWaiting'}
  | {next: 'confirm'}
  | {next: 'giveUp'; failure: ScanFailure};

export const outcomeOf = (job: {
  status: ScanStatus;
  recipe?: unknown;
  photo?: {usable: boolean; problem?: string | null};
  error?: ScanError;
}): ScanOutcome => {
  if (!isFinished(job.status)) {
    return {next: 'keepWaiting'};
  }

  // A picture that could not be read goes back to the photographs with a reason, rather than on
  // to questions about areas that are not there. Retrying is not offered: the same picture would
  // fail the same way, and taking another one starts the scan anyway.
  const problem = photoProblem(job.photo);
  if (job.status === 'COMPLETED' && problem) {
    return {next: 'giveUp', failure: {messageKey: photoProblemMessageKey(problem),
      retryable: false}};
  }
  if (job.status === 'COMPLETED' && job.recipe) {
    return {next: 'confirm'};
  }
  return {next: 'giveUp', failure: failureFromError(job.error)};
};
