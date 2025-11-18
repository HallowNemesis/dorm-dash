import { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  Switch,
} from "react-native";
import { LocationObject } from "expo-location";
import { getSocket } from "../../utils/socket";
import { useAuthUser } from "../../utils/useAuthUser";
import DriverModePage from "../components/DriverModePage";
import SearchBox from "../components/SearchBox";

type RidePageProps = {
  location?: LocationObject | null;
  setActiveRideId: (id: number | null) => void; // NEW
};

type Place = {
  lat: number;
  lng: number;
  name: string;
};

export default function RidePage({ location, setActiveRideId }: RidePageProps) {
  const { userId, role, loading } = useAuthUser();

  const [driverMode, setDriverMode] = useState(false);

  const [useCurrentPickup, setUseCurrentPickup] = useState(true);
  const [pickupText, setPickupText] = useState("Current Location");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [destinationText, setDestinationText] = useState("");
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (location && useCurrentPickup) {
      setPickupText("Current Location");
      setPickupCoords({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    }
  }, [location, useCurrentPickup]);

  // Rider listener + clear active ride on load
  useEffect(() => {
    if (driverMode) return;
    if (loading || !userId) return;

    // rider starts with NO active ride
    setActiveRideId(null);

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit("registerUser", { userId, role: "rider" });

    // For rider: Ride accepted by driver
    socket.on("rideAccepted", (data) => {
      setActiveRideId(data.rideId);     // UNLOCK CHAT
      Alert.alert("Driver Accepted!", `Ride ID: ${data.rideId}`);
    });

    return () => {
      socket.off("rideAccepted");
    };
  }, [loading, userId, driverMode]);

  const handlePickupSelect = (place: Place) => {
    setPickupText(place.name);
    setPickupCoords({ lat: place.lat, lng: place.lng });
  };

  const handleDestinationSelect = (place: Place) => {
    setDestinationText(place.name);
    setDestinationCoords({ lat: place.lat, lng: place.lng });
  };

  const handleRequestRide = () => {
    if (!userId) return Alert.alert("Error", "You must be logged in.");
    if (!pickupCoords) return Alert.alert("Error", "Pickup location not set.");
    if (!destinationCoords)
      return Alert.alert("Error", "Please select a destination.");

    const socket = getSocket();
    socket.emit("requestRide", {
      riderId: userId,
      pickup_lat: pickupCoords.lat,
      pickup_lng: pickupCoords.lng,
      dest_lat: destinationCoords.lat,
      dest_lng: destinationCoords.lng,
    });

    Alert.alert("Ride Requested", destinationText);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading user...</Text>
      </View>
    );
  }

  if (driverMode && role === "driver") {
    return (
      <DriverModePage
        setActiveRideId={setActiveRideId}   // 🔥 PASS DOWN
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request a Ride</Text>

      {role === "driver" && (
        <View style={{ marginBottom: 20 }}>
          <Button
            title="Switch to Driver Mode"
            color="#ff6b6b"
            onPress={() => setDriverMode(true)}
          />
        </View>
      )}

      <View style={styles.row}>
        <Text style={styles.label}>Use Current Location</Text>
        <Switch value={useCurrentPickup} onValueChange={setUseCurrentPickup} />
      </View>

      <SearchBox
        defaultValue={useCurrentPickup ? "Current Location" : pickupText}
        disabled={useCurrentPickup}
        onPlaceSelect={handlePickupSelect}
      />

      <Text style={styles.label}>Destination</Text>
      <SearchBox
        defaultValue={destinationText}
        onSearchChange={(text) => {
          setDestinationText(text);
          setDestinationCoords(null);
        }}
        onPlaceSelect={handleDestinationSelect}
      />

      <Button title="Request Ride" onPress={handleRequestRide} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { textAlign: "center", fontSize: 24, marginBottom: 20 },
  label: { fontSize: 16, marginVertical: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
});
