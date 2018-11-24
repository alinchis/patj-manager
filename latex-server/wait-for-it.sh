#!/bin/sh
# wait-for-postgres.sh

# NOT working, psql: not found


# set -e
#
# host="$1"
# shift
# cmd="$@"

# until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -U "thor" -c '\q'; do
#   >&2 echo "Postgres is unavailable - sleeping"
#   sleep 1
# done

# added to replace non-functioning code from above
sleep 10

# >&2 echo "Postgres is up - executing command"
# exec $cmd
