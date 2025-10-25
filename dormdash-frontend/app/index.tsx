import { Button } from "@react-navigation/elements";
import { useState } from "react";
import { Text, View,StyleSheet, Alert } from "react-native";
import { Link, useNavigation, useRouter } from "expo-router";
import EmailInput from "./components/emailInput";
import PasswordInput from "./components/passwordInput";
import { useLocalSearchParams } from "expo-router";
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
  const navigation= useNavigation()
  const router = useRouter()
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
      <Text style={loginStyle.title}>Login</Text>
      <EmailInput defaultValue={local.email}  onEmailChange={setEmail}/>
        
      <PasswordInput onPassChange={setPassHash}/>
      <Text>Forgot password? Click <Link href={{pathname: "/forgot-password", params:{"email":email}}}>here</Link></Text>
      <View style={{
        display:"flex",
        flexDirection:"row",
      }}>
        <Button style={loginStyle.button} onPress={()=>Alert.alert(email,passHash)}>Login</Button>
        <Button style= {loginStyle.button}  onPress={()=>router.push({pathname:'/signUp',params:{"email":email}})}>Sign up</Button>
      </View>
      
    </View>
  );
}
