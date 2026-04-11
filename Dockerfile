FROM nginx:alpine

# Railway assigns a dynamic $PORT — use nginx's built-in envsubst template processor.
# NGINX_ENVSUBST_FILTER restricts substitution to PORT only, preserving $uri/$host etc.
ENV NGINX_ENVSUBST_FILTER=^PORT$

# Copy site content
COPY . /usr/share/nginx/html

# Copy nginx config as a TEMPLATE so $PORT is substituted at container startup
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Remove any stale default.conf from the base image (template will regenerate it)
RUN rm -f /etc/nginx/conf.d/default.conf
