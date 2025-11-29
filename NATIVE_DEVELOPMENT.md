# Native Development Setup

This project has been ejected from Expo Go to use native iOS, Android, and Web development workflows.

## Prerequisites

1. Node.js (version 18 or higher)
2. npm or yarn
3. Xcode (for iOS development)
4. Android Studio (for Android development)
5. CocoaPods (for iOS dependencies)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. iOS Setup

1. Navigate to the iOS directory:
   ```bash
   cd ios
   ```

2. Install CocoaPods dependencies:
   ```bash
   pod install --repo-update
   ```

3. Return to the project root:
   ```bash
   cd ..
   ```

### 3. Android Setup

1. Make sure Android Studio is installed with the Android SDK
2. Set up Android environment variables in your shell profile:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## Development Commands

### Start Metro Bundler
```bash
npm start
```

### Run on iOS Simulator
```bash
npm run ios
```

### Run on Android Emulator
```bash
npm run android
```

### Run on Web
```bash
npm run web
```

## Building for Release

### Android Debug Build
```bash
npm run build:android
```

### iOS Debug Build
```bash
npm run build:ios
```

## Project Structure

- `ios/` - iOS native project files
- `android/` - Android native project files
- `src/` - React Native source code
- `assets/` - Static assets

## Troubleshooting

### iOS Issues

1. If you encounter Mapbox issues, make sure you have the Mapbox access token set in your environment variables:
   ```bash
   export RNMAPBOX_MAPS_DOWNLOAD_TOKEN=your_mapbox_token
   ```

2. Clean iOS build:
   ```bash
   cd ios
   rm -rf Pods/ Podfile.lock build/
   pod install --repo-update
   cd ..
   ```

### Android Issues

1. Clean Android build:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

## Additional Notes

- The project uses React Native Maps for map functionality
- Mapbox is integrated for enhanced mapping features
- Firebase is used for backend services
- Redux Toolkit is used for state management