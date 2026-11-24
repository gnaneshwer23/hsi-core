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

# Parallel exact create retries use a fixed expiry payload.
r2=00000000-0000-4000-8000-000000000004
q2=00000000-0000-4000-8000-000000000098
expiry=$("${p[@]}" -Atq -c "SELECT now()+interval '1 day'")
create="SELECT hsi_memory.create_record('synthetic-token-alice','a','s','$r2','note','parallel create','[]','$expiry','$q2');"
parallel() {
 local statement="$1"
 "${p[@]}" -Atq -c "BEGIN; SET ROLE sme_fixture_runtime; $statement SELECT pg_sleep(1); COMMIT;" >"$dir/first" &
 local first=$!
 "${p[@]}" -Atq -c "SET ROLE sme_fixture_runtime; $statement" >"$dir/second" &
 local second=$!
 wait "$first"
 wait "$second"
}
parallel "$create"
grep -qx "$r2" "$dir/first"
grep -qx "$r2" "$dir/second"
"${p[@]}" -Atq -c "SELECT count(*) FROM hsi_memory.events WHERE request_id='$q2' AND operation='create'" | grep -qx 1
"${p[@]}" -Atq -c "SELECT count(*) FROM hsi_memory.versions WHERE record_id='$r2'" | grep -qx 1
# Same request ID with different record must be rejected.
if "${p[@]}" -c "SET ROLE sme_fixture_runtime; SELECT hsi_memory.create_record('synthetic-token-alice','a','s','00000000-0000-4000-8000-000000000005','note','parallel create','[]','$expiry','$q2');" >"$dir/collision" 2>&1; then
 echo 'cross-record create collision accepted'; exit 1
fi
grep -q 'Request conflict' "$dir/collision"
grant_id=00000000-0000-4000-8000-000000000097
revoke_id=00000000-0000-4000-8000-000000000096
delete_id=00000000-0000-4000-8000-000000000095
parallel "SELECT hsi_memory.set_share('synthetic-token-alice','a','s','$r2','carol','$expiry',false,'$grant_id');"
"${p[@]}" -Atq -c "SET ROLE sme_fixture_runtime; SELECT count(*) FROM hsi_memory.read_current('synthetic-token-carol','a','s','$r2')" | grep -qx 1
parallel "SELECT hsi_memory.set_share('synthetic-token-alice','a','s','$r2','carol',NULL,true,'$revoke_id');"
"${p[@]}" -Atq -c "SET ROLE sme_fixture_runtime; SELECT count(*) FROM hsi_memory.read_current('synthetic-token-carol','a','s','$r2')" | grep -qx 0
parallel "SELECT hsi_memory.delete_record('synthetic-token-alice','a','s','$r2','$delete_id');"
for id in "$grant_id" "$revoke_id" "$delete_id"; do
 "${p[@]}" -Atq -c "SELECT count(*) FROM hsi_memory.events WHERE request_id='$id'" | grep -qx 1
done
"${p[@]}" -Atq -c "SELECT count(*) FROM hsi_memory.records WHERE id='$r2'" | grep -qx 0
"${p[@]}" -Atq -c "SELECT count(*) FROM hsi_memory.versions WHERE record_id='$r2'" | grep -qx 0
"${p[@]}" -Atq -c "SELECT count(*) FROM hsi_memory.grants WHERE record_id='$r2'" | grep -qx 0
