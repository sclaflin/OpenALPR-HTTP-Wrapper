# Compile alpr
FROM ubuntu:20.04

LABEL description="Open ALPR HTTP Wrapper with Snapshot via Url"
LABEL maintainer "remy@koelemij.eu"

# Workaround for devcontainer to use bash instead of sh
ENV SHELL /bin/bash

# Install prerequisites
RUN apt update \
    && apt upgrade -y \
	&& DEBIAN_FRONTEND="noninteractive" \
        apt install -y \
		# General
		git \
		checkinstall \
		# OpenALPR requirements
		build-essential \
		cmake \
		libcurl3-dev \
		libleptonica-dev \
		liblog4cplus-dev \
		libopencv-dev \
		libtesseract-dev \
	&& rm -rf /var/lib/apt/lists/*

# Clone the latest code from GitHub
WORKDIR /src
RUN git clone https://github.com/openalpr/openalpr.git \
	&& mkdir -p openalpr/src/build

# Build & install OpenALPR
WORKDIR /src/openalpr/src/build
RUN cmake -DCMAKE_INSTALL_PREFIX:PATH=/usr -DCMAKE_INSTALL_SYSCONFDIR:PATH=/etc .. \
	&& make \
	# && make install
	&& checkinstall -y --install=no --addso=yes --pakdir=/src/openalpr --pkgversion=0 --pkgname=alpr

# Build final image
FROM ubuntu:20.04

# Install prerequisites
RUN apt update \
    # && apt upgrade -y \
	&& DEBIAN_FRONTEND="noninteractive" \
        apt install -y \
		# General
		lsb-release \
		gnupg \
		# alpr requirements
		libopencv-videoio4.2 \
		libopencv-video4.2 \
		libopencv-highgui4.2 \
		libopencv-objdetect4.2 \
		libtesseract4 \
		# Nodesource requirements
		apt-transport-https \
		wget \
	&& rm -rf /var/lib/apt/lists/*

# Copy over and install alpr
COPY --from=0 /src/openalpr/alpr_0-1_amd64.deb /app/
RUN dpkg -i /app/alpr_0-1_amd64.deb

# Set up nodesource repo & install nodejs
RUN KEYRING=/usr/share/keyrings/nodesource.gpg \
    && VERSION=node_16.x \
    && DISTRO=$(lsb_release -s -c) \
    && wget --quiet -O - https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor | tee "$KEYRING" >/dev/null \
    && echo "deb [signed-by=$KEYRING] https://deb.nodesource.com/$VERSION $DISTRO main" | tee /etc/apt/sources.list.d/nodesource.list \
    && echo "deb-src [signed-by=$KEYRING] https://deb.nodesource.com/$VERSION $DISTRO main" | tee -a /etc/apt/sources.list.d/nodesource.list \
    && apt update \
    && apt install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy application files over
COPY index.js /app/
COPY config.yaml /app/
COPY package*.json /app/
COPY lib /app/lib

WORKDIR /app

RUN npm ci

# Create the application user
RUN useradd -m app

# Run as the new user
USER app

CMD ["/usr/bin/npm", "start"]
