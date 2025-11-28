import { registerRootComponent } from 'expo';
// Polyfill for Buffer to fix latin1 encoding issues
import { Buffer } from 'buffer';
global.Buffer = Buffer;
import App from './App';
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
