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
  selectedDestination?: { lat: number; lng: number; name: string } | null;
  setActiveRideId: (id: number | null) => void;
};

type Place = {
  lat: number;
  lng: number;
  name: string;
};

export default function RidePage({ location, selectedDestination, setActiveRideId }: RidePageProps) {
  const { userId, role, loading } = useAuthUser();

  const [driverMode, setDriverMode] = useState(false);
  const [useCurrentPickup, setUseCurrentPickup] = useState(true);

  const [pickupText, setPickupText] = useState("Current Location");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [destinationText, setDestinationText] = useState("");
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);

  // AUTO-FILL PICKUP (GPS)
  useEffect(() => {
    if (location && useCurrentPickup) {
      setPickupText("Current Location");
      setPickupCoords({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    }
  }, [location, useCurrentPickup]);

  // AUTO-FILL DESTINATION FROM MAINVIEW
  useEffect(() => {
    if (selectedDestination) {
      setDestinationText(selectedDestination.name);
      setDestinationCoords({
        lat: selectedDestination.lat,
        lng: selectedDestination.lng,
      });
    }
  }, [selectedDestination]);

  // Socket setup
  useEffect(() => {
    if (driverMode) return;
    if (loading || !userId) return;

    setActiveRideId(null);

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit("registerUser", { userId, role: "rider" });

    const handleRideAccepted = (data: any) => {
      setActiveRideId(data.rideId);
      Alert.alert("Driver Accepted!", `Ride ID: ${data.rideId}`);
    };

    socket.on("rideAccepted", handleRideAccepted);

    return () => {
      socket.off("rideAccepted", handleRideAccepted);
    };

  }, [loading, userId, driverMode]);


  const handlePickupSelect = (place: Place) => {
    setUseCurrentPickup(false);
    setPickupText(place.name);
    setPickupCoords({ lat: place.lat, lng: place.lng });
  };

  const handleDestinationSelect = (place: Place) => {
    setDestinationText(place.name);
    setDestinationCoords({ lat: place.lat, lng: place.lng });
  };

  const handleRequestRide = () => {
    if (!userId) return Alert.alert("Error", "You must be logged in.");
    if (!pickupCoords) return Alert.alert("Error", "Pickup missing.");
    if (!destinationCoords) return Alert.alert("Error", "Destination missing.");

    getSocket().emit("requestRide", {
      riderId: userId,
      pickup_lat: pickupCoords.lat,
      pickup_lng: pickupCoords.lng,
      dest_lat: destinationCoords.lat,
      dest_lng: destinationCoords.lng,
    });

    Alert.alert("Ride Requested", destinationText);
  };

  if (loading) return <Text>Loading...</Text>;

  if (driverMode && role === "driver") {
    return <DriverModePage setActiveRideId={setActiveRideId} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request a Ride</Text>

      {role === "driver" && (
        <Button title="Switch to Driver Mode" onPress={() => setDriverMode(true)} />
      )}

      <View style={styles.row}>
        <Text style={styles.label}>Use Current Location</Text>
        <Switch value={useCurrentPickup} onValueChange={setUseCurrentPickup} />
      </View>

      <SearchBox
        defaultValue={pickupText}
        disabled={useCurrentPickup}
        onPlaceSelect={handlePickupSelect}
      />

      <Text style={styles.label}>Destination</Text>
      <SearchBox
        defaultValue={destinationText}
        onSearchChange={() => setDestinationCoords(null)}
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
