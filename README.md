# Sync bug reproduction

This repository uses Bun.js to simply run local typescript files.

## Parts
- ./create_db.sh - creates a local tursodb database with one table and seeded with data
- ./start_sync_server.sh - starts a tursodb sync server
- ./seed_table.sql - sql to create the table
- ./seed_data.sql - sql to insert a few rows of data
- ./without_table_creation.ts - Connects to the sync server, pulls changes, attempts to select all rows from the table
- ./with_table_creation.ts - Connects to the sync server, pulls changes, executes ./seed_table.sql, pushes changes, attempts to select all rows from the table
- ./with_table_creation_and_seed.ts - Connects to the sync server, pulls changes, executes ./seed_table.sql and ./seed_data.sql, pushes changes, attempts to select all rows from the table

## Bug 1

Data doesn't seem to get synced when the database wasn't created through the sync server client.

**Reproduction**
```bash
# in one terminal
./create_db.sh && ./start_sync_server.sh

# in another terminal
bun run without_table_creation.ts
```

This produces this error, even though the table exists in the server database:
```
SqliteError: prepare failed: Parse error: no such table: notes
 rawCode: undefined,
    code: "GenericFailure"
```

**How to make the reproduction work**

If we create the table and fill in the same data as is on the server, the sync will work fine.
Any other client that joins later doesn't have to create the table or fill in the data anymore.

```bash
# in one terminal
./create_db.sh && ./start_sync_server.sh

# in another terminal
bun run with_table_creation_and_seed.ts

# this will also work fine now
bun run without_table_creation.ts
```


## Bug 2 - possible data corruption on client

If the client doesn't fill in the data, only creates the table, it will read 0 rows.
Any other client that attempts to join later will fail on page size being 0.

**Reproduction**
```bash
# in one terminal
./create_db.sh && ./start_sync_server.sh

# in another terminal
bun run with_table_creation.ts
# this will print an empty array (0 rows)

bun run without_table_creation.ts
# this will error
```

This is the produced error:
```
error: step failed: Corrupt database: Invalid page type: 0
 code: "GenericFailure"
```

**Notes on this bug**

1. Restarting the sync server doesn't fix the issue, any clients will still fail on the `Invalid page type: 0` error.
2. Following these steps will cause the error to change to `error: sync engine operation failed: database error: Corrupt database: invalid page size in database header: 0`
    ```bash
    # in terminal 1
    ./create_db.sh && ./start_sync_server.sh
    
    # in terminal 2
    bun run with_table_creation.ts
    
    # in terminal 1
    # - terminate the sync server
    tursodb ./server.db # just open the database and then immediately exit
    ./start_sync_server.sh

    # in terminal 2
    bun run ./with_table_creation.ts
    bun run ./without_table_creation.ts
    # This will error with `invalid page size in database header: 0`
    ```
3. Data in the original server database seems to be unaffected



