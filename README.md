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
- 🔔 **Notification System**: Comprehensive notification management
- 👥 **Real-time Collaboration**: Share trips and collaborate with others
- 🌍 **Global Attractions**: Search and add places from around the world
- 📊 **Advanced Budgeting**: Split bills and visualize spending
- 🌐 **Community Features**: Share trips and discover others' adventures

### Detailed Features
- **Trip Planning**
  - Create trips with title, destination, dates, and descriptions
  - View trip details with cover images
  - Track trip duration and dates
  - Global attractions search with Google Places API
  - Place caching for offline access
  
- **Itinerary Builder**
  - Add destinations to specific days
  - Categorize places (attractions, restaurants, hotels, shopping, activities)
  - Add notes and time slots for each destination
  - Visual day-by-day organization
  - Drag-and-drop reordering

- **Map Integration**
  - Interactive map view with markers
  - Location-based destination search
  - Route planning capabilities
  - Mapbox GL integration for enhanced features
  - Offline map capabilities
  - Drag-to-reorder functionality

- **Budget Management**
  - Set budget by categories
  - Track expenses in real-time
  - Visual progress bars showing spent vs. budgeted amounts
  - Recent expenses list
  - Split bill functionality (even, percentage, exact, shares)
  - Chart visualizations of spending

- **User Profile**
  - Personal statistics (trips count, countries, cities)
  - Account settings
  - Logout functionality
  - Notification preferences
  - Language settings

- **Real-time Collaboration**
  - Share trips with others via invite links
  - Real-time updates with Firebase
  - Online presence indicators
  - Permission management

- **Community Features**
  - Discover public trips
  - Like and comment on trips
  - Auto-generated travel journals
  - Search and filter trips

- **Notification System**
  - Trip reminders (1 day, 1 hour before)
  - Budget alerts (75%, 90% thresholds)
  - Collaboration updates
  - Weather alerts
  - Customizable settings
  - Visual badge indicators

- **Export & Sharing**
  - PDF export for itineraries and journals
  - Print support for web
  - Responsive layouts for all devices

## Tech Stack 🛠️

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **Maps**: Mapbox GL
- **UI Components**: React Native Paper
- **Storage**: AsyncStorage (enhanced for offline mode)
- **Real-time**: Firebase (Auth, Firestore)
- **Charting**: React Native SVG Charts
- **PDF Export**: jsPDF
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
│   │   ├── MapboxMapScreen.tsx
│   │   ├── BudgetScreen.tsx
│   │   ├── EnhancedBudgetScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── AddDestinationScreen.tsx
│   │   ├── PlaceSearchScreen.tsx
│   │   ├── DiscoveryScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   ├── NotificationSettingsScreen.tsx
│   │   └── TravelJournalScreen.tsx
│   ├── navigation/        # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── store/            # Redux store and slices
│   │   ├── index.ts
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       ├── tripsSlice.ts
│   │       ├── itinerarySlice.ts
│   │       ├── budgetSlice.ts
│   │       ├── placesSlice.ts
│   │       ├── collaborationSlice.ts
│   │       ├── tripSyncSlice.ts
│   │       └── notificationsSlice.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── services/         # API and external services
│   │   ├── api.ts
│   │   ├── realtimeService.ts
│   │   ├── placesService.ts
│   │   ├── routeOptimizationService.ts
│   │   ├── pdfExportService.ts
│   │   ├── printService.ts
│   │   ├── offlineStorageService.ts
│   │   ├── weatherService.ts
│   │   ├── calendarService.ts
│   │   ├── shareService.ts
│   │   ├── feedbackService.ts
│   │   ├── crashReportingService.ts
│   │   ├── analyticsService.ts
│   │   └── notificationService.ts
│   ├── utils/            # Utility functions
│   │   ├── theme.ts
│   │   ├── accessibility.ts
│   │   └── performanceMonitor.ts
│   └── hooks/            # Custom hooks
│       └── useNotifications.ts
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

- [ ] Native push notification support
- [ ] Machine learning-based trip recommendations
- [ ] Native mobile calendar integration
- [ ] More external service integrations (Evernote, Notes)
- [ ] Advanced analytics dashboard
- [ ] Social features (following, messaging)
- [ ] Photo gallery and memory sharing
- [ ] Flight and hotel booking integration
- [ ] Multi-language support
- [ ] Dark mode theme
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

4. **Mapbox API** (for enhanced maps)
   - Create Mapbox account
   - Get API access token
   - Configure map styles and offline capabilities

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
