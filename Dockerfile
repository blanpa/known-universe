FROM nginx:1.27-alpine

# Serve the static 3D map via nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY site/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD curl -fsS http://127.0.0.1/ >/dev/null 2>&1 || exit 1
