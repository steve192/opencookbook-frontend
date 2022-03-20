FROM nginx:1.21.6
COPY /web-build /usr/share/nginx/html
EXPOSE 80