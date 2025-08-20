# Use the official Caddy image as the base
FROM caddy:latest

# Install exiftool for metadata removal
RUN apk add --no-cache exiftool

# Copy the Caddyfile to the appropriate location
COPY Caddyfile /etc/caddy/Caddyfile

# Create a directory for the website source
WORKDIR /var/www/html

# Copy the website source code to the container
COPY ./src/ .

# Strip metadata from all image files
RUN find . -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.tiff" -o -iname "*.heic" \) -exec sh -c 'echo "Stripping metadata from: $1"; exiftool -overwrite_original -all= "$1"' _ {} \;

# Expose the port that Caddy will listen on
EXPOSE 80
