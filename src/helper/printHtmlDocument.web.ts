/** How long the frame is kept around after print() so the browser can render it. */
const CLEANUP_DELAY_MS = 1000;

/** A4, so the frame has a page sized layout to render the document into. */
const PAGE_WIDTH = '210mm';
const PAGE_HEIGHT = '297mm';

/**
 * Prints a standalone html document.
 *
 * expo-print's web implementation ignores the document and calls window.print(),
 * which prints the running app - navigation and all. Rendering the document into
 * an off-screen frame and printing that frame instead keeps the result identical
 * to the native one, because both print the very same markup.
 *
 * @param {string} html a complete html document
 * @return {Promise<void>} resolves once the print dialog has been opened
 */
export const printHtmlDocument = (html: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    // Kept off screen rather than sized to nothing: a frame without a layout of
    // its own has nothing to lay the document out in, and prints as a blank page.
    frame.style.position = 'fixed';
    frame.style.left = '-10000px';
    frame.style.top = '0';
    frame.style.width = PAGE_WIDTH;
    frame.style.height = PAGE_HEIGHT;
    frame.style.border = '0';

    frame.onload = () => {
      const frameWindow = frame.contentWindow;
      // A frame that is inserted before it has content loads about:blank first
      // and reports that as a load of its own. Printing it yields an empty page.
      if (!frameWindow?.document.body?.firstChild) {
        return;
      }

      try {
        // Printing the frame requires it to hold the focus
        frameWindow.focus();
        frameWindow.print();
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        // Removing the frame straight away cancels printing in some browsers
        setTimeout(() => frame.remove(), CLEANUP_DELAY_MS);
      }
    };

    // Assigned before the frame enters the document, so the document below is
    // the first and only thing it loads.
    frame.srcdoc = html;
    document.body.appendChild(frame);
  });
