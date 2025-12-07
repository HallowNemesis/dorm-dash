import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";

import SearchBox from "./components/SearchBox";
import RidePage from "./components/RidePage";
import ChatPage from "./components/ChatPage";
import ProfilePage from "./components/ProfilePage";

export default function MainView() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const [selectedDestination, setSelectedDestination] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);

  const [activeRideId, setActiveRideId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "ride" | "chat" | "profile">("home");

  const mapRef = useRef<MapView>(null);

  // Load user GPS
  useEffect(() => {
    async function loadLoc() {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        let { status: req } = await Location.requestForegroundPermissionsAsync();
        if (req !== "granted") {
          Alert.alert("Permission Required", "Location permission is needed.");
          return;
        }
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    }
    loadLoc();
  }, []);

  const region = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        latitude: 37.1,
        longitude: -80.55,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

  // When user selects destination from HOME search bar
  const handlePlaceSelect = (place: { lat: number; lng: number; name: string }) => {
    setSelectedDestination(place);

    mapRef.current?.animateToRegion(
      {
        latitude: place.lat,
        longitude: place.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000
    );

    Alert.alert("Destination Selected", place.name);

    // 🚀 Automatically switch to Ride Page
    setActiveTab("ride");
  };

  const renderTab = () => {
    switch (activeTab) {
      case "home":
        return (
          <View style={styles.container}>
            <View style={styles.searchContainer}>
              <SearchBox onPlaceSelect={handlePlaceSelect} />
            </View>

            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              region={region}
              showsUserLocation
              onMapReady={() => mapRef.current?.animateToRegion(region)}
            />
          </View>
        );

      case "ride":
        return (
          <RidePage
            location={location ?? undefined}
            selectedDestination={selectedDestination}
            setActiveRideId={setActiveRideId}
          />
        );

      case "chat":
        return <ChatPage rideId={activeRideId} />;

      case "profile":
        return <ProfilePage />;

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderTab()}</View>

      <View style={styles.navBar}>
        <Pressable onPress={() => setActiveTab("home")} style={styles.navButton}>
          <Text style={activeTab === "home" ? styles.activeText : styles.inactiveText}>Home</Text>
        </Pressable>

        <Pressable onPress={() => setActiveTab("ride")} style={styles.navButton}>
          <Text style={activeTab === "ride" ? styles.activeText : styles.inactiveText}>Ride</Text>
        </Pressable>

        <Pressable onPress={() => setActiveTab("chat")} style={styles.navButton}>
          <Text style={activeTab === "chat" ? styles.activeText : styles.inactiveText}>Chat</Text>
        </Pressable>

        <Pressable onPress={() => setActiveTab("profile")} style={styles.navButton}>
          <Text
            style={activeTab === "profile" ? styles.activeText : styles.inactiveText}
          >
            Profile
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    position: "absolute",
    top: 40,
    width: "100%",
    paddingHorizontal: 15,
    zIndex: 10,
  },
  content: { flex: 1 },
  navBar: {
    height: 60,
    flexDirection: "row",
    backgroundColor: "#1e1e1e",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navButton: { paddingVertical: 10 },
  activeText: { color: "#ff6b6b", fontWeight: "bold" },
  inactiveText: { color: "#fff" },
});
