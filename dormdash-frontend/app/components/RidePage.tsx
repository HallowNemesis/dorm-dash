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
};


type Place = {
  lat: number;
  lng: number;
  name: string;
};

export default function RidePage({ location }: RidePageProps) {
  const { userId, role, loading } = useAuthUser();

  const [driverMode, setDriverMode] = useState(false);

  const [useCurrentPickup, setUseCurrentPickup] = useState(true);
  const [pickupText, setPickupText] = useState("Current Location");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const [destinationText, setDestinationText] = useState("");
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    if (location && useCurrentPickup) {
      setPickupText("Current Location");
      setPickupCoords({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    }
  }, [location, useCurrentPickup]);

  // Register rider & listen for ride events
  useEffect(() => {
    if (driverMode) return; // only for riders
    if (loading) return;
    if (!userId) return;

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit("registerUser", {
      userId,
      role: "rider",
    });

    socket.on("connect", () => {
      socket.emit("registerUser", {
        userId,
        role: "rider",
      });
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

  // Google Places selection
  const handlePickupSelect = (place: Place) => {
    setPickupText(place.name);
    setPickupCoords({ lat: place.lat, lng: place.lng });
  };

  const handleDestinationSelect = (place: Place) => {
    setDestinationText(place.name);
    setDestinationCoords({ lat: place.lat, lng: place.lng });
  };

  // Request a ride
  const handleRequestRide = () => {
    if (loading) return;

    if (!userId) {
      return Alert.alert("Error", "You must be logged in.");
    }

    if (!pickupCoords) {
      return Alert.alert("Error", "Pickup location not set.");
    }

    if (!destinationCoords) {
      return Alert.alert(
        "Destination Required",
        "Please select a destination from the suggestions list."
      );
    }


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

      {/* Driver Mode Toggle */}
      {role === "driver" && (
        <View style={{ marginBottom: 20 }}>
          <Button
            title="Switch to Driver Mode"
            color="#ff6b6b"
            onPress={() => setDriverMode(true)}
          />
        </View>
      )}

      {/* Pickup + auto-filled */}
      <View style={styles.row}>
        <Text style={styles.label}>Use Current Location</Text>
        <Switch
          value={useCurrentPickup}
          onValueChange={(t) => setUseCurrentPickup(t)}
        />
      </View>

      {/* Pickup + auto-filled  */}
      <SearchBox
        defaultValue={useCurrentPickup ? "Current Location" : pickupText}
        disabled={useCurrentPickup}
        onPlaceSelect={handlePickupSelect}
      />

      {/* DESTINATION */}
      <Text style={styles.label}>Destination</Text>
      <SearchBox
        defaultValue={destinationText}
        onSearchChange={(text) => {
          setDestinationText(text);
          setDestinationCoords(null); // <-- Prevents stale coordinates
        }}
        onPlaceSelect={handleDestinationSelect}
      />

      <Button title="Request Ride" onPress={handleRequestRide} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
});