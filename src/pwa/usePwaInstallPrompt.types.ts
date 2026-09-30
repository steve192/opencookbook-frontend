/**
 * - `native`: Chromium browsers, whose own install dialog `install()` opens.
 * - `ios-safari`: no install api; the ui shows the Share, Add to Home Screen steps instead.
 */
export type PwaInstallMethod = 'native' | 'ios-safari';

export interface PwaInstallPromptState {
  /** Installing is possible right now; for entry points that ignore earlier dismissals. */
  canInstall: boolean;
  installMethod: PwaInstallMethod | null;
  /** The banner may show: installable and not dismissed. */
  available: boolean;
  install(): Promise<'accepted' | 'dismissed' | 'unavailable'>;
  /** Hides the banner for a week. */
  dismiss(): void;
  dontAskAgain(): void;
}
