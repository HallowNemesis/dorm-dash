import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { LocationObject } from 'expo-location';


type RidePageProps = {
  location?: LocationObject | null;
};

export default function RidePage({ location }: RidePageProps) {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");

  const handleRequestRide = () => {
    if (!pickup || !destination) {
      Alert.alert("Error", "Please enter both pickup and destination locations");
      return;
    }

    // TODO: connect to backend / socket to request ride
    Alert.alert("Ride Requested", `Pickup: ${pickup}\nDestination: ${destination}`);
    setPickup("");
    setDestination("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request a Ride</Text>

      <TextInput
        placeholder="Pickup location"
        value={pickup}
        onChangeText={setPickup}
        style={styles.input}
      />

      <TextInput
        placeholder="Destination"
        value={destination}
        onChangeText={setDestination}
        style={styles.input}
      />

      <Button title="Request Ride" onPress={handleRequestRide} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
});
