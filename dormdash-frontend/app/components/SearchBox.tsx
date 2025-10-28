import React from "react";
import GooglePlacesTextInput from 'react-native-google-places-textinput';
type Props = {
  onSearchChange?: (str: string) => void;
  defaultValue?: string;
};
const customStyles = {
    container: {
      width: '90%',
       backgroundColor:"#bfbfbf",
      marginHorizontal: 0,
      borderRadius:10
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
export default function SearchBox({ onSearchChange, defaultValue = "" }: Props) {
  const apiKey = process.env.GOOGLE_PLACES_KEY || "";
     return (
    <GooglePlacesTextInput
      apiKey={apiKey}
      placeHolderText="Where do you want to go?"
      value={defaultValue}
      onPlaceSelect={(place: any) => {
        const name =
          place?.name ||
          place?.formatted_address ||
          place?.description ||
          place?.title ||
          JSON.stringify(place);
        onSearchChange?.(name);
      }}
      onTextChange={onSearchChange}
      style={customStyles} 
      />
  );
}