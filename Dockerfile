FROM nginx:1.23.2
ENV NGINX_ENVSUBST_TEMPLATE_SUFFIX=.conf
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx
ENV DEBUG_MODE=false
COPY nginx/nginx.conf /etc/nginx/templates/nginx.conf.conf

COPY /web-build /usr/share/nginx/html
EXPOSE 80