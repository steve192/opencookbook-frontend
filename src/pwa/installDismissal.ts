const NOT_NOW_MILLIS = 7 * 24 * 60 * 60 * 1000;

// "Not now" hides the banner for a week, "Don't ask again" for good.
export const notNowUntil = (now: number): number => now + NOT_NOW_MILLIS;

export const isDismissed = (dontAskAgain: string | null, notNowUntilStored: string | null, now: number): boolean =>
  dontAskAgain === '1' || Number(notNowUntilStored ?? 0) > now;
