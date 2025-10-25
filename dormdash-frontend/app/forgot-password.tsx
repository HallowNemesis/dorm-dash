import { Button } from "@react-navigation/elements";
import { useState } from "react";
import { Text, View,StyleSheet, Alert } from "react-native";
import { Link } from "expo-router";
import EmailInput from "./components/emailInput";
const loginStyle = StyleSheet.create({
   title:{
    fontSize:50,
    fontWeight:100
   }
})
export default function Index() {
  const [email,setEmail]= useState('')
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginBottom:"80%"
      }}
    >
      <Text style={loginStyle.title}>Reset Password</Text>
      <EmailInput onEmailChange={setEmail}/>
      <Text>Nevermind! Take me <Link href={"/"}>back</Link></Text>
      <Button onPress={()=>Alert.alert(email)}>Reset Password</Button>
    </View>
  );
}
