import Constants from "expo-constants";
import GooglePlacesTextInput from 'react-native-google-places-textinput';

type Props = {
  onSearchChange?: (str: string) => void;
  defaultValue?: string;
  onPlaceSelect?: (location: { lat: number; lng: number; name: string }) => void;
  disabled?: boolean;  
};

const customStyles = {
  container: {
    width: '90%',
    backgroundColor: "#bfbfbf",
    marginHorizontal: 0,
    borderRadius: 10,
    alignSelf: "center"
  },
  input: {
    height: 45,
    borderColor: '#cccccc',
    borderRadius: 10,
  },
  suggestionsContainer: {
    backgroundColor: '#ffffff',
    maxHeight: 250,
  },
  suggestionItem: {
    padding: 15,
  },
  suggestionText: {
    main: {
      fontSize: 16,
      color: '#333',
    },
    secondary: {
      fontSize: 14,
      color: '#666',
    }
  },
  loadingIndicator: {
    color: '#999',
  },
  placeholder: {
    color: '#999',
  }
} as const;

export default function SearchBox({ onSearchChange, defaultValue = "", onPlaceSelect, disabled }: Props) {

  const apiKey =
    Constants.expoConfig?.extra?.googlePlacesKey ||
    process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY ||
    "";


  return (
    <GooglePlacesTextInput
      apiKey={apiKey}
      placeHolderText="Where do you want to go?"
      value={defaultValue}
      onPlaceSelect={(place: any) => {
        if (disabled) return;                // ⬅ Prevent selection
        const coords = place?.geometry?.location;
        if (coords && onPlaceSelect) {
          onPlaceSelect({
            lat: coords.lat,
            lng: coords.lng,
            name: place.name || place.formatted_address || "Unknown location",
          });
        }
      }}
      onTextChange={(text) => {
        if (disabled) return;
        onSearchChange && onSearchChange(text);
      }}
      style={{
        ...customStyles,
        input: {
          ...customStyles.input,
          backgroundColor: disabled ? "#eee" : "#fff",   // ⬅ Grey-out box when disabled
        },
      }}
    />
  );
}