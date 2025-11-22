FROM nginx:stable-alpine

# Copy custom nginx configuration that listens on Cloud Run's default port 8080
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets
COPY . /usr/share/nginx/html

# Cloud Run expects the container to listen on $PORT (defaults 8080)
ENV PORT=8080
EXPOSE 8080

# Use exec form to keep nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

