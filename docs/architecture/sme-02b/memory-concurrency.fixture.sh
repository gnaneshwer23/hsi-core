#!/usr/bin/env bash
# CI disposable PostgreSQL only.
set -euo pipefail
export PGOPTIONS='-c statement_timeout=15000 -c lock_timeout=10000'
p=(psql -X -v ON_ERROR_STOP=1 -h 127.0.0.1 -U postgres -d sme_fixture)
dir=$(mktemp -d)
trap 'rm -rf "$dir"' EXIT
r=00000000-0000-4000-8000-000000000003
q=00000000-0000-4000-8000-000000000099
sql="SELECT hsi_memory.revise('synthetic-token-alice','a','s','$r',1,'parallel','[]','$q');"
# First connection holds the row lock until commit; second retries same request.
"${p[@]}" -Atq -c "BEGIN; SET ROLE sme_fixture_runtime; $sql SELECT pg_sleep(2); COMMIT;" >"$dir/a" &
a=$!
"${p[@]}" -Atq -c "SET ROLE sme_fixture_runtime; $sql" >"$dir/b" &
b=$!
wait "$a"
wait "$b"
grep -qx 2 "$dir/a"
grep -qx 2 "$dir/b"
"${p[@]}" -Atq -c "SELECT count(*) FROM hsi_memory.events WHERE request_id='$q' AND operation='revise'" | grep -qx 1
"${p[@]}" -Atq -c "SELECT count(*) FROM hsi_memory.versions WHERE record_id='$r'" | grep -qx 2
# A different request with stale expected version must fail.
if "${p[@]}" -c "SET ROLE sme_fixture_runtime; SELECT hsi_memory.revise('synthetic-token-alice','a','s','$r',1,'conflict','[]',gen_random_uuid());" >"$dir/conflict" 2>&1; then
 echo 'stale revision accepted'; exit 1
fi
grep -q 'Version conflict' "$dir/conflict"
# A second tenant cannot read the committed record.
if "${p[@]}" -c "SET ROLE sme_fixture_runtime; SELECT * FROM hsi_memory.read_current('synthetic-token-bob','a','s','$r');" >"$dir/denied" 2>&1; then
 echo 'cross tenant read accepted'; exit 1
fi
grep -q 'Memory unavailable' "$dir/denied"
