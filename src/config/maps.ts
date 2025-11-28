export const GOOGLE_MAPS_API_KEY = 'AIzaSyBmFCy71VLlgNcbvEQNu2azuSM5flgArE4';

// Mapbox Access Token - replace with your own
export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsdXJzdG9uMDAwdHEybG8zcXV0bHd1YzgifQ.69Q40v5N7kMCjm7AhjD1-w';

export const mapStyle = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'simplified' }],
  },
];

export const defaultMapRegion = {
  latitude: 25.0330,
  longitude: 121.5654,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};