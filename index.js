/**
 * @format
 */

// react-native-url-polyfill MUST be imported before anything that touches
// `URL` (Supabase's realtime client rewrites URL.protocol at construction
// time, which RN's built-in URL implementation doesn't allow — hence
// "Cannot assign to property 'protocol' which has only a getter").
import 'react-native-url-polyfill/auto'
// Must be the very first *native module* import — sets up gesture-handler's
// event listeners before anything else touches the JS runtime.
import 'react-native-gesture-handler'
import { AppRegistry } from 'react-native'
import App from './App'
import { name as appName } from './app.json'

AppRegistry.registerComponent(appName, () => App)
