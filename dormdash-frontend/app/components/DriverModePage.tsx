import { useEffect, useState, useRef } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import * as Location from "expo-location";
import { getSocket } from "../../utils/socket";
import { useAuthUser } from "../../utils/useAuthUser";

export default function DriverModePage({ setActiveRideId }) {
  const { userId, role, loading } = useAuthUser();
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const locationInterval = useRef<any>(null);

  useEffect(() => {
    if (loading || !userId) return;

    const socket = getSocket();
    socket.emit("registerUser", { userId, role: "driver" });

    socket.on("newRideAssigned", (data) => {
      Alert.alert(
        "New Ride Assigned",
        `Pickup: (${data.pickup_lat.toFixed(5)}, ${data.pickup_lng.toFixed(5)})`,
        [
          {
            text: "Accept",
            onPress: () => acceptRide(data.rideId),
          },
          { text: "Ignore", style: "cancel" },
        ]
      );
    });

    return () => {
      socket.off("newRideAssigned");
    };
  }, [loading, userId]);

  const acceptRide = (rideId: number) => {
    const socket = getSocket();

    socket.emit("acceptRide", {
      rideId,
      driverId: userId,
    });

    setActiveRideId(rideId); // 🔥 DRIVER ACTIVATES CHAT TOO

    Alert.alert("Ride Accepted", "The rider has been told.");
  };

  const goOnline = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert("Permission Required", "Location needed.");
    }

    setIsOnline(true);

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
        console.log("GPS error", err);
      }
    }, 2000);
  };

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

  if (loading) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (!userId) {
    return <View style={styles.container}><Text>Error: not logged in.</Text></View>;
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
          {location.coords.latitude.toFixed(5)}, {location.coords.longitude.toFixed(5)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 26, textAlign: "center", marginBottom: 20 },
  statusContainer: { alignItems: "center", padding: 10, marginBottom: 20, backgroundColor: "#eee", borderRadius: 10 },
  statusText: { fontSize: 20, fontWeight: "600" },
  coords: { marginTop: 20, textAlign: "center", color: "#555" },
});
