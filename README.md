# TripWeaver 🌍

A comprehensive cross-platform trip planning application similar to Funliday, built with React Native and Expo for iOS, Android, and Web (Desktop).

## Features ✨

### Core Features
- 📅 **Trip Management**: Create, edit, and manage multiple trips
- 🗺️ **Interactive Maps**: Integrated map view with location markers
- 📍 **Itinerary Planning**: Day-by-day itinerary builder with destinations
- 💰 **Budget Tracking**: Track expenses and manage trip budgets by category
- 👤 **User Authentication**: Login and registration system
- 📱 **Cross-Platform**: Works on iOS, Android, and Web

### Detailed Features
- **Trip Planning**
  - Create trips with title, destination, dates, and descriptions
  - View trip details with cover images
  - Track trip duration and dates
  
- **Itinerary Builder**
  - Add destinations to specific days
  - Categorize places (attractions, restaurants, hotels, shopping, activities)
  - Add notes and time slots for each destination
  - Visual day-by-day organization

- **Map Integration**
  - Interactive map view with markers
  - Location-based destination search (ready for Google Maps/Mapbox integration)
  - Route planning capabilities

- **Budget Management**
  - Set budget by categories
  - Track expenses in real-time
  - Visual progress bars showing spent vs. budgeted amounts
  - Recent expenses list

- **User Profile**
  - Personal statistics (trips count, countries, cities)
  - Account settings
  - Logout functionality

## Tech Stack 🛠️

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **Maps**: React Native Maps
- **UI Components**: React Native Paper
- **Storage**: AsyncStorage (ready for offline mode)
- **Platforms**: iOS, Android, Web

## Prerequisites 📋

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development on Mac)
- Android Studio (for Android development)

## Installation 🚀

1. **Clone the repository**
   ```bash
   cd TripWeaver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on specific platforms**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## Project Structure 📁

```
TripWeaver/
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/           # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── TripDetailScreen.tsx
│   │   ├── CreateTripScreen.tsx
│   │   ├── ItineraryScreen.tsx
│   │   ├── MapScreen.tsx
│   │   ├── BudgetScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── AddDestinationScreen.tsx
│   ├── navigation/        # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── store/            # Redux store and slices
│   │   ├── index.ts
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       ├── tripsSlice.ts
│   │       ├── itinerarySlice.ts
│   │       └── budgetSlice.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── services/         # API and external services
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, and static files
├── App.tsx              # Root component
├── app.json             # Expo configuration
└── package.json         # Dependencies and scripts
```

## Building for Production 🏗️

### Android
```bash
npm run build:android
```

### iOS
```bash
npm run build:ios
```

### Web
```bash
npm run build:web
```

## Deployment Options 🚢

### Mobile Apps
- **iOS**: Deploy via Apple App Store using Expo EAS Build
- **Android**: Deploy via Google Play Store using Expo EAS Build

### Web/Desktop
- **Web Hosting**: Deploy the web build to services like:
  - Vercel
  - Netlify
  - Firebase Hosting
  - AWS Amplify

- **Desktop (Electron)**: Convert the web version to desktop app using Electron
  ```bash
  npm install -D electron electron-builder
  ```

## Future Enhancements 🔮

- [ ] Firebase/Backend integration for data persistence
- [ ] Real-time collaboration with other users
- [ ] Offline mode with data synchronization
- [ ] Photo gallery and memory sharing
- [ ] Social sharing features
- [ ] Weather integration
- [ ] Flight and hotel booking integration
- [ ] Google Maps/Mapbox API integration
- [ ] Push notifications for trip reminders
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Export itinerary as PDF
- [ ] Native desktop app with Electron

## API Integration Notes 📝

To fully implement the app with real data:

1. **Google Maps API** (for maps and places)
   - Enable Google Maps JavaScript API
   - Enable Places API
   - Add API key to app configuration

2. **Backend/Firebase** (for data persistence)
   - Set up Firebase project
   - Configure Firestore for database
   - Set up Firebase Authentication
   - Add Firebase config to the app

3. **Weather API** (optional)
   - OpenWeatherMap API
   - WeatherAPI

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is licensed under the MIT License.

## Acknowledgments 🙏

Inspired by Funliday and other popular trip planning applications.

## Support 💬

For issues and questions, please create an issue in the repository.

---

Built with ❤️ using React Native and Expo
