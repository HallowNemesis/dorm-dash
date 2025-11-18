import appJson from "./app.json";

export default {
  ...appJson,
  expo: {
    ...appJson.expo,

    ios: {
      ...appJson.expo.ios,
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },

    android: {
      ...appJson.expo.android,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },

    extra: {
      googlePlacesKey: process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY,
    },
  },
};
