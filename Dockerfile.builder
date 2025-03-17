#docker build -f Dockerfile.builder . -t easbuilder
#docker run -it -e EXPO_TOKEN= -v "$(pwd)":/builder easbuilder <eas profile for building>

FROM ubuntu:24.04

RUN echo '\
Acquire::Retries "100";\
Acquire::https::Timeout "240";\
Acquire::http::Timeout "240";\
APT::Get::Assume-Yes "true";\
APT::Install-Recommends "false";\
APT::Install-Suggests "false";\
Debug::Acquire::https "true";\
' > /etc/apt/apt.conf.d/99custom

RUN apt-get update && \
    apt-get install -y openjdk-17-jdk android-sdk android-sdk-platform-23 sdkmanager curl git && \
    apt-get clean


# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

RUN npm i --global eas-cli-local-build-plugin expo-cli eas-cli

COPY scripts/build-android.sh /usr/local/bin/build-android

RUN git config --global --add safe.directory /builder

ENV ANDROID_HOME /usr/lib/android-sdk
RUN sdkmanager --install "build-tools;29.0.3" "ndk-bundle;r26" "ndk;26.1.10909125" "platforms;android-35" "tools;26.1.1"
# RUN yes | sdkmanager --licenses


RUN mkdir /builder
WORKDIR /builder

# EAS clones the repository internally, this fails if the repository is not considered as safe
RUN git config --global --add safe.directory /builder/.git

ENV EXPO_TOKEN ""

ENTRYPOINT ["/usr/local/bin/build-android"]

