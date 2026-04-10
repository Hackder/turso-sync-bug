#!/usr/bin/env bash

set -e

echo "Starting sync server..."
tursodb ./server.db --sync-server 0.0.0.0:8080

