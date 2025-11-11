import dotenv from 'dotenv';
import appJson from './app.json';
dotenv.config({ path: './frontend/.env' });


export default {
  ...appJson,
  expo: {
    ...appJson.expo,
    ios: {
      ...appJson.expo.ios,
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      ...appJson.expo.android,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    extra: {
      googlePlacesKey: process.env.GOOGLE_PLACES_KEY,
    },
  },
};
