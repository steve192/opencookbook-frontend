import {Workbox} from 'workbox-window';

// sw.js only exists in a production export (build-web); the dev server answers unknown paths with
// index.html, which registering as a worker fails on.
const workerExists = async () => {
  const response = await fetch('/sw.js', {method: 'HEAD'});
  return response.ok && (response.headers.get('content-type') ?? '').includes('javascript');
};

/**
 * Registers the service worker. A new version waits until the reader agrees to reload, so nothing
 * reloads in the middle of an edit.
 *
 * @param {Function} onUpdateWaiting offered a way to switch to the new version and reload
 */
export const registerServiceWorker = async (onUpdateWaiting: (reload: () => void) => void) => {
  if (!('serviceWorker' in navigator) || !await workerExists()) {
    return;
  }
  const workbox = new Workbox('/sw.js');
  workbox.addEventListener('waiting', () => onUpdateWaiting(() => {
    workbox.addEventListener('controlling', () => window.location.reload());
    workbox.messageSkipWaiting();
  }));
  await workbox.register();
};
