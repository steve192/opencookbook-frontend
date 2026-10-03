import {SignupState} from '../api/types/account';

/** What to tell somebody whose account was just created, which depends on what happens next. */
export const SIGNUP_OUTCOME_KEYS = {
  ACTIVE: {title: 'screens.login.signupActive.title', message: 'screens.login.signupActive.message'},
  AWAITING_CONFIRMATION: {title: 'screens.login.activationpendingtitle', message: 'screens.login.activationpending'},
  AWAITING_APPROVAL: {title: 'screens.login.signupApproval.title', message: 'screens.login.signupApproval.message'},
} as const satisfies Record<SignupState, {title: string, message: string}>;
