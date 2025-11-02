#!/bin/sh
set -e

# Abort if JWT_SECRET is not provided
if [ -z "${JWT_SECRET:-}" ]; then
  echo >&2 "ERROR: The JWT_SECRET environment variable is not set."
  echo >&2 "Set JWT_SECRET before starting the container (e.g., -e JWT_SECRET=\"secret-value\")."
  exit 1
fi

# If everything is ok, run the provided command (default: node server.js)
exec "$@"
