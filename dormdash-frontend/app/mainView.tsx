import { Button } from "@react-navigation/elements";
import { useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import { Link, useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import EmailInput from "./components/emailInput";
import PasswordInput from "./components/passwordInput";
import SearchBox from "./components/SearchBox";
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { Drawer } from 'expo-router/drawer';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Logout } from "./utils/auth";
// ngrok tunnel URL for backend API 
const API_BASE = "https://dawn-youthful-disrespectfully.ngrok-free.dev/api/auth";

const loginStyle = StyleSheet.create({
  title: {
    fontSize: 50,
    fontWeight: "100",
  },
  button: {
    margin: 10,
  },
});

export default function Index() {
    const router = useRouter();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
useEffect(()=>{
    async function  getCurrentLocation() {
        let {status} = await Location.getForegroundPermissionsAsync();
        if( status !== 'granted'){
            //TODO: disable app features if no location?
            Alert.alert("Location permissions required for app to work");
            return;
        }
          let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }
    getCurrentLocation();
});
 const handleLogOut= async () => {
    await Logout(()=>{router.push("/")})
 }
const bottomSheetRef = useRef<BottomSheet>(null);
  return (
    <View style={{ flex: 1, justifyContent: "flex-start", alignItems: "center" }}>
      <MapView style={{width:"100%", height:"100%"}} showsUserLocation={true} showsCompass={true} followsUserLocation={true} region={{latitude:location?.coords.latitude, longitude:location?.coords.longitude}}>
        <View style={{marginTop: "10%", alignItems:"center"}}>
            <SearchBox />
            
        </View>
        <BottomSheet ref={bottomSheetRef} enableHandlePanningGesture={true}>
            <BottomSheetView>
                 <SearchBox />
                <Button onPress={handleLogOut}>Logout</Button>
            </BottomSheetView>
        </BottomSheet>
      </MapView>
    </View>
  );
}
