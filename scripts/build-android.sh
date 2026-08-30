#!/bin/sh
set -e

yes | sdkmanager --licenses

if [ -n "$2" ]; then
    output_file="$2"
else
    output_file="app-build.apk"
fi

cd /builder

npm ci
eas build --local \
    --non-interactive \
    --output="./$output_file" \
    --platform=android \
    --profile="$1"
