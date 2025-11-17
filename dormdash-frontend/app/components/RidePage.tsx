import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { LocationObject } from "expo-location";
import { getSocket } from "../../utils/socket";
import { useAuthUser } from "../../utils/useAuthUser";
import { useRouter } from "expo-router";
import DriverModePage from "../components/DriverModePage";

type RidePageProps = {
  location?: LocationObject | null;
};

export default function RidePage({ location }: RidePageProps) {
  const router = useRouter();
  const { userId, role, loading } = useAuthUser();

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [driverMode, setDriverMode] = useState(false);

  // Register rider and listen for ride events
  useEffect(() => {
    if (loading || !userId || driverMode) return;

    const socket = getSocket();

    socket.emit("registerUser", {
      userId: userId,
      role: "rider",
    });

    socket.on("matchFound", (data) => {
      Alert.alert("Driver Found!", `Ride ID: ${data.rideId}`);
    });

    socket.on("noDriversAvailable", () => {
      Alert.alert("No drivers available right now.");
    });

    socket.on("rideAccepted", (data) => {
      Alert.alert("Driver Accepted!", `Ride ID: ${data.rideId}`);
    });

    return () => {
      socket.off("matchFound");
      socket.off("noDriversAvailable");
      socket.off("rideAccepted");
    };
  }, [loading, userId, driverMode]);

  const handleRequestRide = () => {
    if (loading) return;
    if (!userId) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }
    if (!pickup || !destination) {
      Alert.alert("Error", "Enter pickup & destination");
      return;
    }
    if (!location) {
      Alert.alert("Error", "GPS not available.");
      return;
    }

    const socket = getSocket();

    socket.emit("requestRide", {
      riderId: userId,
      pickup_lat: location.coords.latitude,
      pickup_lng: location.coords.longitude,
      dest_lat: location.coords.latitude + 0.001, // TEMP
      dest_lng: location.coords.longitude + 0.001, // TEMP
    });

    Alert.alert("Ride Requested", destination);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading user...</Text>
      </View>
    );
  }

  if (driverMode) {
    return (
      <View style={{ flex: 1 }}>
        <Button
          title="Switch to Rider Mode"
          onPress={() => setDriverMode(false)}
          color="#888"
        />
        <DriverModePage />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request a Ride</Text>

      {/* Only drivers can toggle driver mode */}
      {role === "driver" && (
        <View style={{ marginBottom: 20 }}>
          <Button
            title="Switch to Driver Mode"
            color="#ff6b6b"
            onPress={() => setDriverMode(true)}
          />
        </View>
      )}

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
