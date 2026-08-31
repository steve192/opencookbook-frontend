import * as Print from 'expo-print';

/**
 * Prints a standalone html document.
 *
 * The native implementation hands the document to the system print service,
 * which renders it in its own web view. The web build uses a different
 * implementation (see printHtmlDocument.web.ts), because expo-print ignores the
 * document on web and prints the page the app is running in.
 *
 * @param {string} html a complete html document
 * @return {Promise<void>} resolves once printing has been handed off
 */
export const printHtmlDocument = async (html: string): Promise<void> => {
  await Print.printAsync({html});
};
