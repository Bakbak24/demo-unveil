# Welcome to our Unveil App 👋

This is an [Expo](https://expo.dev) project created by following the [`setting up environment at expo docs`](https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=simulated&mode=development-build).

## Development Setup

As a developer(Rayen) using a Windows system, I chose the Android Simulator option for setting up the environment. Since the project uses Mapbox, which is a custom native module, I had to opt for a Development Build instead of Expo Go. This allows us to include Expo's developer tools while using custom native modules.

Our team consists of developers using both Windows (Android) and Mac (iOS) systems. Below are the setup instructions for both platforms.
Prerequisites

Before you start, make sure you have the following installed:

- Node.js

For Android Developers:

- Android Studio (for Android emulator setup)

For iOS Developers:

- Xcode (for iOS simulator setup)

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Install EAS CLI

   ```bash
    npm install -g eas-cli
   ```

3. Log in with EAS

   ```bash
    eas login
   ```

4. Configure build

   ```bash
    eas build:configure
   ```

5. Create a build

   ```bash
    eas build --platform android --profile development
   ```

6. Start the app

   ```bash
    npx expo start
   ```
