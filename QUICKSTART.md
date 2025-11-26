# TripWeaver - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the App
```bash
npm start
```

### 3. Choose Your Platform

After running `npm start`, you'll see a QR code and menu options:

**For Mobile Testing:**
- iOS: Press `i` to open iOS Simulator (Mac only)
- Android: Press `a` to open Android Emulator
- Physical Device: Scan QR code with Expo Go app

**For Desktop/Web:**
- Press `w` to open in web browser

## 📱 Platform-Specific Instructions

### iOS (requires Mac)
1. Install Xcode from App Store
2. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
3. Run: `npm run ios`

### Android
1. Install Android Studio
2. Set up Android Virtual Device (AVD)
3. Run: `npm run android`

### Web/Desktop
Simply run: `npm run web`

The web version works on:
- Chrome
- Firefox
- Safari
- Edge

Can be converted to desktop app using Electron.

## 🎯 First Login

The app uses mock authentication for development:

**Login Credentials:**
- Email: any@email.com
- Password: any password

Just enter any email and password to log in!

## 🗺️ Features Overview

### After Login, You Can:

1. **Create Trips**
   - Click "+ New Trip" on the home screen
   - Fill in trip details (title, destination, dates)

2. **Plan Itinerary**
   - Go to a trip
   - Navigate to Itinerary tab
   - Add destinations day by day

3. **View on Map**
   - Check Map tab to see locations
   - Interactive map with markers

4. **Manage Budget**
   - Budget tab shows expense tracking
   - Add expenses by category
   - Visual progress indicators

5. **Profile**
   - View your trips statistics
   - Access settings
   - Logout

## 🛠️ Development Commands

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web

# Build for production
npm run build:android    # Android APK
npm run build:ios        # iOS IPA
npm run build:web        # Web build
```

## 📝 Common Issues & Solutions

### Issue: "Metro bundler not starting"
**Solution:**
```bash
# Clear cache and restart
npx expo start -c
```

### Issue: "Module not found"
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Issue: "iOS simulator not opening"
**Solution:**
```bash
# Open Xcode and install simulators
# Then run: npx expo run:ios
```

### Issue: Version compatibility warnings
**Solution:**
```bash
# Update packages to compatible versions
npx expo install --fix
```

## 🔄 Next Steps

1. **Add Real Backend**
   - Integrate Firebase for authentication
   - Set up Firestore for data storage
   - Add cloud functions

2. **Map Integration**
   - Get Google Maps API key
   - Enable Places API
   - Integrate geocoding

3. **Advanced Features**
   - Offline mode
   - Push notifications
   - Social sharing
   - Photo uploads

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

## 💡 Tips

- Use web version for fastest development iteration
- Test on actual devices for best performance assessment
- Check README.md for detailed documentation
- Hot reload is enabled - save files to see changes instantly

## 🆘 Need Help?

- Check console logs for errors
- Use React DevTools for debugging
- Review code comments for implementation details
- Create an issue in the repository

---

Happy Trip Planning! 🌍✈️
