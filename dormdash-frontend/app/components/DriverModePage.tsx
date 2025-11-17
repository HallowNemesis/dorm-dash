import { useEffect, useState, useRef } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import * as Location from "expo-location";
import { getSocket } from "../../utils/socket";
import { useAuthUser } from "../../utils/useAuthUser";

export default function DriverModePage() {
  const { userId, role, loading } = useAuthUser();

  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState<any>(null);

  const locationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading || !userId) return;

    const socket = getSocket();

    // Register driver ONCE
    socket.emit("registerUser", {
      userId,
      role: "driver",
    });

    // When backend assigns a ride
    socket.on("newRideAssigned", (data) => {
      Alert.alert(
        "New Ride Assigned",
        `Rider ID: ${data.riderId}\nPickup Location: (${data.pickup_lat.toFixed(
          5
        )}, ${data.pickup_lng.toFixed(5)})`,
        [
          { text: "Accept", onPress: () => acceptRide(data.rideId) },
          { text: "Ignore", style: "cancel" },
        ]
      );
    });

    return () => {
      socket.off("newRideAssigned");
    };
  }, [loading, userId]);

  // Permission request
  const requestPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Location access is required.");
      return false;
    }
    return true;
  };

  // Driver clicks "Go Online"
  const goOnline = async () => {
    if (!(await requestPermissions())) return;

    setIsOnline(true);

    // Start sending location every 2 seconds
    locationInterval.current = setInterval(async () => {
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);

        const socket = getSocket();
        socket.emit("driverStatusUpdate", {
          userId,
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          isAvailable: true,
        });
      } catch (err) {
        console.log("Failed to get GPS", err);
      }
    }, 2000);
  };

  // Driver clicks "Go Offline"
  const goOffline = () => {
    setIsOnline(false);

    const socket = getSocket();
    socket.emit("driverStatusUpdate", {
      userId,
      lat: null,
      lng: null,
      isAvailable: false,
    });

    if (locationInterval.current) clearInterval(locationInterval.current);
  };

  // Accept a ride
  const acceptRide = (rideId: number) => {
    const socket = getSocket();

    socket.emit("acceptRide", {
      rideId,
      driverId: userId,
    });

    Alert.alert("Ride Accepted", "The rider has been notified.");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading user...</Text>
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={styles.container}>
        <Text>Error: You must be logged in as a driver.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Mode</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isOnline ? "ONLINE" : "OFFLINE"}
        </Text>
      </View>

      <Button
        title={isOnline ? "Go Offline" : "Go Online"}
        color={isOnline ? "red" : "green"}
        onPress={isOnline ? goOffline : goOnline}
      />

      {location && (
        <Text style={styles.coords}>
          {location.coords.latitude.toFixed(5)},{" "}
          {location.coords.longitude.toFixed(5)}
        </Text>
      )}
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
    fontSize: 26,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },
  statusContainer: {
    alignItems: "center",
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#eee",
    borderRadius: 10,
  },
  statusText: {
    fontSize: 20,
    fontWeight: "600",
  },
  coords: {
    marginTop: 20,
    textAlign: "center",
    color: "#555",
  },
});
