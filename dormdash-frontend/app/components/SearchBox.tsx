import React, { useState } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from "react-native";
import Constants from "expo-constants";

type Props = {
  defaultValue?: string;
  onSearchChange?: (str: string) => void;
  onPlaceSelect?: (place: { lat: number; lng: number; name: string }) => void;
  disabled?: boolean;
};

export default function SearchBox({
  defaultValue = "",
  onSearchChange,
  onPlaceSelect,
  disabled,
}: Props) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<any[]>([]);
  const apiKey = Constants.expoConfig?.extra?.googlePlacesKey;

  const searchPlaces = async (text: string) => {
    setQuery(text);
    onSearchChange?.(text);

    if (disabled || text.length < 2) {
      setResults([]);
      return;
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      text
    )}&key=${apiKey}&components=country:us`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.predictions) {
      setResults(data.predictions);
    } else {
      setResults([]);
    }
  };

  const selectPlace = async (placeId: string, description: string) => {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;

    const res = await fetch(detailsUrl);
    const data = await res.json();

    const loc = data.result?.geometry?.location;
    if (!loc) return;

    setQuery(description);
    setResults([]);

    onPlaceSelect?.({
      lat: loc.lat,
      lng: loc.lng,
      name: description,
    });
  };

  return (
    <View>
      <TextInput
        style={[styles.input, disabled && { backgroundColor: "#eee" }]}
        value={query}
        editable={!disabled}
        placeholder="Search place..."
        onChangeText={searchPlaces}
      />

      {results.length > 0 && !disabled && (
        <FlatList
          style={styles.suggestions}
          data={results}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => selectPlace(item.place_id, item.description)}
            >
              <Text>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 45,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    marginBottom: 5,
    backgroundColor: "#fff",
  },
  suggestions: {
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: 250,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
