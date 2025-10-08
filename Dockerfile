FROM nginx:1.29.2

RUN chown nginx:nginx /etc/nginx -R && \
    chown nginx:nginx /var/cache/nginx -R && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid 

USER nginx

ENV NGINX_ENVSUBST_TEMPLATE_SUFFIX=.conf
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx
ENV DEBUG_MODE=false
COPY nginx/nginx.conf /etc/nginx/templates/nginx.conf.conf

COPY /dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]