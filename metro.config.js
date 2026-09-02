const http = require('http');
const https = require('https');
const {getDefaultConfig} = require('expo/metro-config');

/**
 * Everything under here is answered by the api rather than by the bundler, exactly as the
 * production reverse proxy routes it.
 */
const API_PREFIX = '/api/';

const backend = new URL(process.env.API_PROXY_TARGET ?? 'http://localhost:8080');

/**
 * Hands one request to the backend and pipes the answer back.
 *
 * The forwarded headers mirror what opencookbook-proxy sends, so the api sees the same thing in
 * development as it does in production - including which address it is being reached on, which
 * is what share links are built from.
 *
 * @param {http.IncomingMessage} request the request that came in to the dev server
 * @param {http.ServerResponse} response where to write the answer
 */
const relayToBackend = (request, response) => {
  const client = backend.protocol === 'https:' ? https : http;

  const upstream = client.request({
    hostname: backend.hostname,
    port: backend.port,
    method: request.method,
    path: request.url,
    headers: {
      ...request.headers,
      'x-forwarded-host': request.headers.host,
      'x-forwarded-proto': 'http',
      'x-forwarded-for': request.socket.remoteAddress,
    },
  }, (upstreamResponse) => {
    response.writeHead(upstreamResponse.statusCode, upstreamResponse.headers);
    upstreamResponse.pipe(response);
  });

  upstream.on('error', (error) => {
    // A backend that is not running is the most likely reason to land here, and a dev server
    // that says so beats one that hangs or serves the app's index.html as if it were json.
    response.writeHead(502, {'Content-Type': 'text/plain'});
    response.end(`Cannot reach the api at ${backend.origin}: ${error.message}`);
  });

  request.pipe(upstream);
};

const config = getDefaultConfig(__dirname);

// The web app resolves its api from the origin it was served from, which is right in every
// deployment because the reverse proxy puts both on one host. The dev server is the only place
// that is not true, so it relays /api instead - the alternative is telling the app about a
// second origin, which then has to be configured, kept in sync, and allowed through CORS.
config.server = {
  ...config.server,
  enhanceMiddleware: (metroMiddleware, server) => (request, response, next) => {
    if (request.url?.startsWith(API_PREFIX)) {
      relayToBackend(request, response);
      return undefined;
    }
    return metroMiddleware(request, response, next);
  },
};

module.exports = config;
