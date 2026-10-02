/** The documents an instance publishes about itself. */
export const LEGAL_DOCUMENTS = ['terms', 'privacy', 'imprint'] as const;
export type LegalDocument = typeof LEGAL_DOCUMENTS[number];
