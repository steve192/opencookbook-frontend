# Local EAS Android builder image.
# Usage: docker run -e EXPO_TOKEN=... -e DEFAULT_API_URL=... \
#          -v "$(pwd)":/builder ghcr.io/steve192/cookpal-easbuilder:latest <eas-profile> [output-file]
#
# Three stages:
#   1. `base`    - all tooling (JDK, Node, Android SDK, NDKs, CMake).
#   2. `prewarm` - runs a real Gradle build against the current app source to
#                  populate ~/.gradle and ~/.npm caches (Gradle wrapper
#                  distribution, Maven artifacts, Kotlin compiler, etc.).
#                  Source is discarded; only the caches are kept.
#   3. `final`   - base tooling + populated caches + entrypoint script.
#
# Secret handling: EXPO_TOKEN is supplied at `docker run` time only. It is never
# passed as a --build-arg or --secret, and no RUN command needs it.

# ============================================================================
# Stage 1: shared base tooling
# ============================================================================
FROM ubuntu:26.04 AS base

RUN echo '\
Acquire::Retries "100";\
Acquire::https::Timeout "240";\
Acquire::http::Timeout "240";\
APT::Get::Assume-Yes "true";\
APT::Install-Recommends "false";\
APT::Install-Suggests "false";\
Debug::Acquire::https "true";\
' > /etc/apt/apt.conf.d/99custom && \
    apt-get update && \
    apt-get install -y openjdk-17-jdk curl git unzip && \
    # Must track .nvmrc's major: the lockfile is written by the npm that
    # ships with that Node, and an older npm's `npm ci` rejects it.
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Build tools / platform / NDK matching Expo SDK 57 (React Native 0.86).
RUN mkdir -p $ANDROID_HOME/cmdline-tools && \
    curl -o /tmp/commandlinetools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip && \
    unzip /tmp/commandlinetools.zip -d $ANDROID_HOME/cmdline-tools && \
    mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest && \
    rm /tmp/commandlinetools.zip && \
    npm i --global eas-cli-local-build-plugin @expo/cli eas-cli && \
    yes | sdkmanager --licenses > /dev/null && \
    sdkmanager --install \
        "build-tools;35.0.0" \
        "build-tools;36.0.0" \
        "ndk;27.0.12077973" \
        "ndk;27.1.12297006" \
        "cmake;3.22.1" \
        "platforms;android-36" \
        "platform-tools" \
        "cmdline-tools;latest" && \
    git config --global --add safe.directory /builder && \
    git config --global --add safe.directory /builder/.git

# ============================================================================
# Stage 2: prewarm caches with a real Gradle build of the current app
# ============================================================================
FROM base AS prewarm

ENV GRADLE_USER_HOME=/root/.gradle

# Mirrors splex's whole-directory copy (it copies `frontend/`). .dockerignore
# keeps this lean, and copying everything means a future local config plugin or
# newly referenced asset cannot silently fall out of the prewarm.
COPY . /tmp/app

# Install JS deps, generate the native Android project, and compile native
# sources to populate Gradle's Maven/Kotlin/NDK caches. We deliberately stop
# before dex/R8/APK packaging - those are the disk-heavy steps and they produce
# build-specific outputs that do not help future builds.
#
# Only the Gradle step is allowed to fail: a warm cache is a nice-to-have, so a
# compile error in the current source should not block the image. `npm ci` and
# `prebuild` failing are real errors and must stop the build here - note that
# `&&`/`||` share precedence in sh, so a trailing `|| true` on one long chain
# would swallow *every* failure and yield an image with no cache at all.
#
# The cache directories are created up front so the COPY in the final stage
# still resolves when Gradle bailed out before writing anything.
RUN set -eu; \
    mkdir -p /root/.gradle/caches /root/.gradle/wrapper /root/.npm; \
    cd /tmp/app; \
    npm ci; \
    npx expo prebuild --platform android --no-install; \
    cd android; \
    ./gradlew --no-daemon compileReleaseSources \
      || echo "WARNING: prewarm Gradle build failed; shipping a partial cache"; \
    cd /; \
    rm -rf /tmp/app

# ============================================================================
# Stage 3: final image - base + caches only, no source
# ============================================================================
FROM base AS final

# Only the dependency caches and Gradle wrapper distribution. Excludes
# ~/.gradle/daemon and ~/.gradle/native (process state, not useful).
COPY --from=prewarm /root/.gradle/caches /root/.gradle/caches
COPY --from=prewarm /root/.gradle/wrapper /root/.gradle/wrapper
COPY --from=prewarm /root/.npm /root/.npm

RUN mkdir -p /builder

COPY scripts/build-android.sh /usr/local/bin/build-android
RUN chmod +x /usr/local/bin/build-android

WORKDIR /builder

ENV EXPO_TOKEN=""

ENTRYPOINT ["/usr/local/bin/build-android"]
