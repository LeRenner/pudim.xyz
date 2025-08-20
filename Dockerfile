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

# Create and run metadata stripping script
RUN echo '#!/bin/bash\n\
# Find common picture formats and strip all metadata\n\
find . -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.tiff" -o -iname "*.heic" \) | while read -r file; do\n\
    echo "Stripping metadata from: $file"\n\
    exiftool -overwrite_original -all= "$file"\n\
done' > /tmp/strip_metadata.sh && \
    chmod +x /tmp/strip_metadata.sh && \
    /tmp/strip_metadata.sh && \
    rm /tmp/strip_metadata.sh

# Expose the port that Caddy will listen on
EXPOSE 80
