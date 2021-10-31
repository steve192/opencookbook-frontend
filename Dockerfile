FROM nginx
COPY /web-build /usr/share/nginx/html
EXPOSE 80