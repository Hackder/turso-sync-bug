#!/usr/bin/env bash

set -e

echo -n "Removing current database..."
rm -f ./server.db ./server.db-wal
echo "Done!"

echo -n "Creating database..."
tursodb ./server.db "$(cat ./seed_table.sql) $(cat ./seed_data.sql)"
echo "Done!"
