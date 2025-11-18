import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";

import SearchBox from "./components/SearchBox";
import RidePage from "./components/RidePage";
import ChatPage from "./components/ChatPage"; // assuming exists
import ProfilePage from "./components/ProfilePage";

export default function MainView() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    "home" | "ride" | "chat" | "profile"
  >("home");

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.getForegroundPermissionsAsync();

      if (status !== "granted") {
        const { status: requestStatus } =
          await Location.requestForegroundPermissionsAsync();

        if (requestStatus !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Location permission is required for the app to function properly."
          );
          return;
        }
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }
    getCurrentLocation();
  }, []);



  const region = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : { latitude: 0, longitude: 0, latitudeDelta: 0.01, longitudeDelta: 0.01 };

  const handlePlaceSelect = (place: {
    lat: number;
    lng: number;
    name: string;
  }) => {
    const newRegion = {
      latitude: place.lat,
      longitude: place.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    mapRef.current?.animateToRegion(newRegion, 1000);
    Alert.alert("Navigating to:", place.name);
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
              showsUserLocation
              showsCompass
              followsUserLocation
              region={region}
              onMapReady={() => {
                mapRef.current?.animateToRegion(region);
              }}
            />
          </View>
        );
      case "ride":
        return <RidePage location={location ?? undefined} />;
      case "chat":
        return <ChatPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Main content */}
      <View style={styles.content}>{renderTab()}</View>

      {/* Bottom navigation */}
      <View style={styles.navBar}>
        <Pressable
          onPress={() => setActiveTab("home")}
          style={styles.navButton}
        >
          <Text
            style={
              activeTab === "home" ? styles.activeText : styles.inactiveText
            }
          >
            Home
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("ride")}
          style={styles.navButton}
        >
          <Text
            style={
              activeTab === "ride" ? styles.activeText : styles.inactiveText
            }
          >
            Ride
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("chat")}
          style={styles.navButton}
        >
          <Text
            style={
              activeTab === "chat" ? styles.activeText : styles.inactiveText
            }
          >
            Chat
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("profile")}
          style={styles.navButton}
        >
          <Text
            style={
              activeTab === "profile" ? styles.activeText : styles.inactiveText
            }
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
  content: {
    flex: 1,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    backgroundColor: "#1e1e1e",
  },
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  activeText: {
    color: "#ff6b6b",
    fontWeight: "bold",
  },
  inactiveText: {
    color: "#fff",
  },
  
});
