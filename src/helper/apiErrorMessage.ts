import {NETWORK_UNREACHABLE, toApiError} from '../dao/ApiError';

/**
 * What to tell the reader about each failure the server can name. One table for the whole app;
 * a screen needing its own wording passes a fallback rather than keeping a second copy.
 *
 * One entry per member of the server's ApiErrorCode enum.
 */
export const MESSAGE_KEYS = {
  [NETWORK_UNREACHABLE]: 'errors.offline',

  VALIDATION_FAILED: 'errors.validation',
  MALFORMED_REQUEST: 'errors.validation',
  UNSUPPORTED_MEDIA_TYPE: 'errors.unsupportedMediaType',
  NOT_ACCEPTABLE: 'errors.unsupportedMediaType',
  METHOD_NOT_ALLOWED: 'errors.unknown',
  UNSUPPORTED_FILE_TYPE: 'errors.unsupportedFileType',
  FILE_TOO_LARGE: 'errors.fileTooLarge',

  AUTHENTICATION_REQUIRED: 'errors.authenticationRequired',
  INVALID_CREDENTIALS: 'errors.invalidCredentials',
  ACCOUNT_NOT_ACTIVATED: 'errors.accountNotActivated',
  ACCESS_DENIED: 'errors.accessDenied',

  EMAIL_ALREADY_REGISTERED: 'errors.emailAlreadyRegistered',
  SIGNUP_DISABLED: 'errors.signupDisabled',
  ACTIVATION_LINK_INVALID: 'errors.activationLinkInvalid',
  PASSWORD_RESET_LINK_INVALID: 'errors.passwordResetLinkInvalid',
  LAST_ADMINISTRATOR: 'errors.lastAdministrator',

  RESOURCE_NOT_FOUND: 'errors.notFound',
  CONFLICT: 'errors.conflict',
  RATE_LIMITED: 'errors.rateLimited',
  MAIL_DELIVERY_FAILED: 'errors.mailFailed',

  IMPORT_URL_INVALID: 'errors.importUrlInvalid',
  IMPORT_NOT_SUPPORTED: 'errors.importNotSupported',
  IMPORT_FAILED: 'errors.importFailed',

  SCAN_TOO_MANY_PAGES: 'screens.recipeScan.errors.tooManyPages',
  SCAN_IMAGE_UNREADABLE: 'screens.recipeScan.errors.badImage',
  SCAN_IMAGE_TOO_LARGE: 'screens.recipeScan.errors.imageTooLarge',
  SCAN_IMAGE_UNSUPPORTED: 'screens.recipeScan.errors.unsupportedImage',
  SCAN_NO_TEXT_FOUND: 'screens.recipeScan.errors.noTextFound',
  SCAN_DAILY_LIMIT_REACHED: 'screens.recipeScan.errors.dailyLimit',
  SCAN_BUSY: 'screens.recipeScan.errors.busy',
  SCAN_UNAVAILABLE: 'screens.recipeScan.errors.unavailable',
  SCAN_TIMED_OUT: 'screens.recipeScan.errors.timedOut',
  SCAN_FAILED: 'screens.recipeScan.errors.failed',

  TEMPORARILY_UNAVAILABLE: 'errors.serverError',
  INTERNAL_ERROR: 'errors.serverError',
} as const;

/** Every message this app can show for a failure. */
export type ErrorMessageKey = typeof MESSAGE_KEYS[keyof typeof MESSAGE_KEYS];

const UNKNOWN: ErrorMessageKey = 'errors.unknown';

/**
 * Which message explains a code the server sent.
 *
 * The fallback is only reached for a code this app has no name for - a server newer than
 * itself, or a proxy answering in its place.
 *
 * @param {string} code what the server called the failure
 * @param {string} fallback what to say when the code has no message of its own
 * @return {string} the key of the message to show
 */
export const messageKeyForCode = <Fallback extends string = never>(
  code: string, fallback: Fallback | ErrorMessageKey = UNKNOWN,
): Fallback | ErrorMessageKey =>
    MESSAGE_KEYS[code as keyof typeof MESSAGE_KEYS] ?? fallback;

/**
 * Which message explains a failed request.
 *
 * @param {unknown} error what the call rejected with
 * @param {string} fallback what to say when the failure has no message of its own
 * @return {string} the key of the message to show
 */
export const errorMessageKey = <Fallback extends string = never>(
  error: unknown, fallback: Fallback | ErrorMessageKey = UNKNOWN,
): Fallback | ErrorMessageKey => messageKeyForCode(toApiError(error).code, fallback);
