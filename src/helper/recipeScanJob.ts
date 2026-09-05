/** Waiting for a photographed recipe to be read, and saying what went wrong when it is not. */

import {
  PhotoMessageKey,
  photoProblem,
  photoProblemMessageKey,
} from './recipeScanPhoto';

/** The states a scan moves through. Mirrors what the server calls them. */
export type ScanStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface ScanError {
  code: string;
  message: string;
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

/** Which message to show for a failure. */
export type ScanMessageKey =
  | 'screens.recipeScan.errors.dailyLimit'
  | 'screens.recipeScan.errors.busy'
  | 'screens.recipeScan.errors.unavailable'
  | 'screens.recipeScan.errors.imageTooLarge'
  | 'screens.recipeScan.errors.unsupportedImage'
  | 'screens.recipeScan.errors.tooManyPages'
  | 'screens.recipeScan.errors.badImage'
  | 'screens.recipeScan.errors.noTextFound'
  | 'screens.recipeScan.errors.timedOut'
  | 'common.unknownerror';

const MESSAGES: Record<string, ScanMessageKey> = {
  USER_QUOTA_EXCEEDED: 'screens.recipeScan.errors.dailyLimit',
  QUOTA_EXCEEDED: 'screens.recipeScan.errors.busy',
  TOO_MANY_IN_FLIGHT: 'screens.recipeScan.errors.busy',
  ML_UNREACHABLE: 'screens.recipeScan.errors.unavailable',
  TOKEN_REVOKED: 'screens.recipeScan.errors.unavailable',
  TOKEN_EXPIRED: 'screens.recipeScan.errors.unavailable',
  INVALID_TOKEN: 'screens.recipeScan.errors.unavailable',
  ATTACHMENT_TOO_LARGE: 'screens.recipeScan.errors.imageTooLarge',
  ATTACHMENT_TYPE_UNSUPPORTED: 'screens.recipeScan.errors.unsupportedImage',
  ATTACHMENT_COUNT_INVALID: 'screens.recipeScan.errors.tooManyPages',
  INVALID_PAYLOAD: 'screens.recipeScan.errors.badImage',
  OCR_NO_TEXT_FOUND: 'screens.recipeScan.errors.noTextFound',
  ML_TIMEOUT: 'screens.recipeScan.errors.timedOut',
  JOB_ABANDONED: 'screens.recipeScan.errors.timedOut',
};

const UNKNOWN: ScanMessageKey = 'common.unknownerror';

export const scanErrorMessageKey = (error?: ScanError): ScanMessageKey =>
  (error && MESSAGES[error.code]) || UNKNOWN;

// Whether sending the very same photographs again could succeed.
export const isWorthRetrying = (error?: ScanError): boolean =>
  !error || (error.retryable && error.code !== 'USER_QUOTA_EXCEEDED');

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
  messageKey: ScanMessageKey | PhotoMessageKey;
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
