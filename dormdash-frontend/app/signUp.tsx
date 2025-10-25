import { Button } from "@react-navigation/elements";
import { useState } from "react";
import { Text, View,StyleSheet, Alert } from "react-native";
import { Link } from "expo-router";
import EmailInput from "./components/emailInput";
import PasswordInput from "./components/passwordInput";
import { useLocalSearchParams } from "expo-router";
const loginStyle = StyleSheet.create({
   title:{
    fontSize:50,
    fontWeight:100
   }
})
export default function SignUp() {
  const [email,setEmail]= useState('')
  const[passHash,setPassHash]=useState('')
  const[confirmPassHash,setConfirmPassHash]=useState('')
  const local = useLocalSearchParams()
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginBottom:"80%"
      }}
    >
      <Text style={loginStyle.title}>Sign Up</Text>
      <EmailInput defaultValue={local.email} onEmailChange={setEmail}/>
      <PasswordInput onPassChange={setPassHash}/>
      <PasswordInput onPassChange={setConfirmPassHash}/>
      <Text>Nevermind! Take me <Link href={{pathname:"/", params:{"email":email}}}>Back</Link></Text>
      <Button onPress={()=>Alert.alert(email,passHash+" "+ confirmPassHash)}>Sign Up</Button>
    </View>
  );
}
