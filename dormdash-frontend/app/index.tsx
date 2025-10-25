import { Button } from "@react-navigation/elements";
import { useState } from "react";
import { Text, TextInput, View,StyleSheet, Alert } from "react-native";
import { Link } from "expo-router";
import EmailInput from "./components/emailInput";
import PasswordInput from "./components/passwordInput";
const loginStyle = StyleSheet.create({
   title:{
    fontSize:50,
    fontWeight:100
   },
   button:{
    margin:10
   }
})
export default function Index() {
  const [email,setEmail]= useState('')
  const[passHash,setPassHash]=useState('')
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginBottom:"80%"
      }}
    >
      <Text style={loginStyle.title}>Login</Text>
      <EmailInput onEmailChange={setEmail}/>
        
      <PasswordInput onPassChange={setPassHash}/>
      <Text>Forgot password? Click <Link href={"/forgot-password"}>here</Link></Text>
      <View style={{
        display:"flex",
        flexDirection:"row",
      }}>
        <Button style={loginStyle.button} onPress={()=>Alert.alert(email,passHash)}>Login</Button>
        <Button style= {loginStyle.button}  onPress={()=>Alert.alert(email,passHash)}>Sign up</Button>
      </View>
      
    </View>
  );
}
