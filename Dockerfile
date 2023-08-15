# Use the official Caddy image as the base
FROM caddy:latest

# Copy the Caddyfile to the appropriate location
COPY Caddyfile /etc/caddy/Caddyfile

# Create a directory for the website source
WORKDIR /var/www/html

# Copy the website source code to the container
COPY ./src/ .

# Expose the port that Caddy will listen on
EXPOSE 80
