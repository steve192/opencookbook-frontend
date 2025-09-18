#docker build -f Dockerfile.builder . -t easbuilder
#docker run -it -e EXPO_TOKEN= -v "$(pwd)":/builder easbuilder <eas profile for building>

FROM ubuntu:22.04

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
    apt-get install -y openjdk-17-jdk curl git unzip && \
    apt-get clean

# Install Node.js 22.x (latest LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

# Install Android SDK directly from Google
ENV ANDROID_HOME /opt/android-sdk
ENV PATH $PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

RUN mkdir -p $ANDROID_HOME/cmdline-tools && \
    curl -o /tmp/commandlinetools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip && \
    unzip /tmp/commandlinetools.zip -d $ANDROID_HOME/cmdline-tools && \
    mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest && \
    rm /tmp/commandlinetools.zip

# Install modern CLI tools (expo-cli is deprecated)
RUN npm i --global eas-cli-local-build-plugin @expo/cli eas-cli

COPY scripts/build-android.sh /usr/local/bin/build-android

RUN git config --global --add safe.directory /builder

# Install updated build tools, NDK, and platforms for React Native 0.79 / Expo SDK 53
RUN sdkmanager --install \
    "build-tools;34.0.0" \
    "ndk;27.0.12077973" \
    "platforms;android-34" \
    "platform-tools" \
    "cmdline-tools;latest"
# RUN yes | sdkmanager --licenses

RUN mkdir /builder
WORKDIR /builder

# EAS clones the repository internally, this fails if the repository is not considered as safe
RUN git config --global --add safe.directory /builder/.git

ENV EXPO_TOKEN ""

ENTRYPOINT ["/usr/local/bin/build-android"]

