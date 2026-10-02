FROM node:24.21.0-bookworm-slim AS node

# The Expo web export, served under /app.
FROM node AS app
ENV EXPO_NO_TELEMETRY=1
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY App.tsx app.config.js app.json metro.config.js tsconfig.json workbox-config.js ./
COPY @types ./@types
COPY assets ./assets
COPY public ./public
COPY scripts ./scripts
COPY src ./src
RUN npm run build-web

# The landing page at the root. The built-page checks gate the image.
FROM node AS landing
ENV ASTRO_TELEMETRY_DISABLED=1
WORKDIR /app/landing
COPY landing/package.json landing/package-lock.json ./
RUN npm ci
# sync-assets copies the favicon from ../assets/icon.png.
COPY assets/icon.png /app/assets/icon.png
COPY landing ./
RUN npm run check && npm run build && npm test

FROM nginx:1.31.6

RUN chown nginx:nginx /etc/nginx -R && \
    chown nginx:nginx /var/cache/nginx -R && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid 

USER nginx

ENV NGINX_ENVSUBST_TEMPLATE_SUFFIX=.conf
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx
ENV DEBUG_MODE=false
ENV LANDING_ENABLED=false
COPY nginx/nginx.conf /etc/nginx/templates/nginx.conf.conf

COPY --from=landing /app/landing/dist /usr/share/nginx/html
COPY --from=app /app/dist /usr/share/nginx/html/app
COPY nginx/root /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
