import { Button } from "@react-navigation/elements";
import { useEffect, useRef, useState } from "react";
import {View, Alert } from "react-native";
import {useRouter } from "expo-router";
import SearchBox from "./components/SearchBox";
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Logout } from "../utils/auth";

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
      <MapView style={{width:"100%", height:"100%"}} showsUserLocation={true} showsCompass={true} followsUserLocation={true} region={ location ? {latitude:location.coords.latitude, longitude:location.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01} : undefined}>
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
