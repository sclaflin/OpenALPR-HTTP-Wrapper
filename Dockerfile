FROM ubuntu:16.04

LABEL description="Open ALPR HTTP Wrapper"
LABEL maintainer "seanclaflin@protonmail.com"

# Install some binaries
RUN apt update \
    && apt upgrade -y \
    && apt install -y openalpr wget apt-transport-https \
    && rm -rf /var/lib/apt/lists/*

# Set up nodesource repo & install nodejs
RUN KEYRING=/usr/share/keyrings/nodesource.gpg \
    && VERSION=node_16.x \
    && DISTRO=xenial \
    && wget --quiet -O - https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor | tee "$KEYRING" >/dev/null \
    && echo "deb [signed-by=$KEYRING] https://deb.nodesource.com/$VERSION $DISTRO main" | tee /etc/apt/sources.list.d/nodesource.list \
    && echo "deb-src [signed-by=$KEYRING] https://deb.nodesource.com/$VERSION $DISTRO main" | tee -a /etc/apt/sources.list.d/nodesource.list \
    && apt update \
    && apt install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create the application user
RUN useradd -m alpr

# Run as the new user
USER alpr

# Copy application files over
COPY index.js /app/
COPY config.yaml /app/
COPY package*.json /app/
COPY lib /app/lib
COPY node_modules /app/node_modules

WORKDIR /app

CMD ["/usr/bin/npm", "start"]