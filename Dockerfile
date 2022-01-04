FROM nginx:1.21.5
COPY /web-build /usr/share/nginx/html
EXPOSE 80