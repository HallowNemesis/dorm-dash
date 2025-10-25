import { Button } from "@react-navigation/elements";
import { useState } from "react";
import { Text, TextInput, View,StyleSheet, Alert } from "react-native";
import bcrypt from 'bcrypt-react-native'
import { has } from "lodash";
const loginStyle = StyleSheet.create({
   input:{
    backgroundColor:"#bfbfbf",
    width:"80%",
    height:50,
    margin:10,
    borderRadius:10,
   },
   title:{
    fontSize:50,
    fontWeight:100
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
      <TextInput style={loginStyle.input} placeholderTextColor="#6e6e6e" autoComplete="email" onChangeText={newEmail=>setEmail(newEmail)} placeholder="email@university.edu"/>
        
      <TextInput style={loginStyle.input} autoComplete="current-password" onChangeText={
        //Eventually this should use some sort of hashing function, but i can't find a modern solution for react native (short of building our own..)
        // I tried bcrypt and similar libraries, but they are unavailbe for react native.
        newPass=>setPassHash(newPass)
      } secureTextEntry={true}/>
      <Button onPress={()=>Alert.alert(email,passHash)}>Login</Button>
    </View>
  );
}
