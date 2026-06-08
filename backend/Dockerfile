FROM alpine:3.18

# Install g++, python3, openjdk17, and bash
RUN apk update && apk add --no-cache \
    g++ \
    python3 \
    openjdk17 \
    bash

# Set working directory
WORKDIR /app

# Run as a non-root user for security
RUN adduser -D -u 1001 sandbox
USER sandbox

CMD ["/bin/bash"]
