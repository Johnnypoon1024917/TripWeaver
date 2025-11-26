export const GOOGLE_MAPS_API_KEY = 'AIzaSyBmFCy71VLlgNcbvEQNu2azuSM5flgArE4';

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
