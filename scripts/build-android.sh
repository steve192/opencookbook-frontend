#!/bin/sh

npm ci
# eas build --local \
#     --non-interactive \
#     --output=./app-build.apk \
#     --platform=android \
#     --profile=production-apk

eas build --local \
    --non-interactive \
    --output=./app-build.apk \
    --platform=android \
    --profile=$1
