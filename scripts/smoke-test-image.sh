#!/usr/bin/env bash
# Starts the image with the landing page on and off and checks what nginx answers.
# Usage: scripts/smoke-test-image.sh <image>
set -euo pipefail

image="${1:?usage: $0 <image>}"
containers=()

cleanup() {
  if [ "${#containers[@]}" -gt 0 ]; then
    docker rm -f "${containers[@]}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

fail() {
  echo "FAIL $*" >&2
  exit 1
}

# start <landing enabled>: sets $base once nginx answers. Runs in the shell itself so the trap sees the container.
start() {
  local id port
  id=$(docker run -d -p 127.0.0.1::80 -e "LANDING_ENABLED=$1" "$image")
  containers+=("$id")
  port=$(docker port "$id" 80/tcp | head -n 1 | sed 's/.*://')
  for _ in $(seq 1 50); do
    if curl -s -o /dev/null "http://127.0.0.1:$port/app/"; then
      base="http://127.0.0.1:$port"
      return
    fi
    sleep 0.2
  done
  docker logs "$id" >&2
  fail "nginx did not come up (LANDING_ENABLED=$1)"
}

# check <label> <base> <path> <expected status> [expected pattern in headers+body]
# Extra curl arguments can be given through CURL_ARGS.
check() {
  local label=$1 base=$2 path=$3 status=$4 pattern=${5:-} response
  # shellcheck disable=SC2086
  response=$(curl -s -D - ${CURL_ARGS:-} "$base$path" | tr -d '\r') || fail "$label: request failed"
  if ! head -n 1 <<<"$response" | grep -q " $status"; then
    fail "$label: $path expected status $status, got $(head -n 1 <<<"$response")"
  fi
  if [ -n "$pattern" ] && ! grep -qiE "$pattern" <<<"$response"; then
    fail "$label: $path does not match '$pattern'"
  fi
  echo "ok   $label: $path -> $status ${pattern:+($pattern)}"
}

echo "== landing on"
start true
on=$base
on_container=${containers[0]}
check on "$on" / 200 'content-type: text/html'
check on "$on" /de/ 200
check on "$on" /self-hosting/ 200
check on "$on" /self-hosting 301 'location: /self-hosting/$'
check on "$on" /does-not-exist 404 'content-type: text/html'
check on "$on" /robots.txt 200 'Disallow: /app/'
asset=$(docker exec "$on_container" sh -c 'ls /usr/share/nginx/html/_astro | head -n 1')
check on "$on" "/_astro/$asset" 200 'cache-control: .*immutable'
body_404=$(curl -s "$on/does-not-exist")
[ "$body_404" = "$(docker exec "$on_container" cat /usr/share/nginx/html/404.html)" ] || fail "on: /does-not-exist is not the landing 404 page"
echo "ok   on: /does-not-exist serves 404.html"

echo "== landing off"
start false
off=$base
off_container=${containers[1]}
check off "$off" / 302 'location: /app/$'
check off "$off" /weekly 302 'location: /app/weekly$'
check off "$off" /robots.txt 200 'Disallow: /$'

bundle=$(docker exec "$on_container" sh -c 'cd /usr/share/nginx/html/app && ls _expo/static/js/web/*.js | head -n 1')
app_asset=$(docker exec "$on_container" sh -c 'cd /usr/share/nginx/html && find app/assets -type f | head -n 1')
for base in "$on" "$off"; do
  echo "== both ($base)"
  check both "$base" /app 301 'location: /app/$'
  check both "$base" /app/ 200 'content-type: text/html'
  check both "$base" /app/weekly 200 'content-type: text/html'
  check both "$base" /app/_expo/static/js/web/missing.js 404
  check both "$base" "/$app_asset" 200 'cache-control: .*immutable'
  check both "$base" /app/sw.js 200 'content-type: (application|text)/javascript'
  check both "$base" /app/manifest.webmanifest 200 'content-type: application/manifest\+json'
  check both "$base" /sw.js 200 'content-type: (application|text)/javascript'
  check both "$base" /.well-known/assetlinks.json 200 'content-type: application/json'
  check both "$base" /share/abc 301 'location: /app/share/abc$'
  check both "$base" '/activateAccount?activationId=1' 301 'location: /app/activateAccount\?activationId=1$'
  check both "$base" /tos 301 'location: /app/legal/terms$'
  CURL_ARGS="-H Accept-Encoding:gzip -o /dev/null" check both "$base" "/app/$bundle" 200 'content-encoding: gzip'
done

echo "all checks passed"
