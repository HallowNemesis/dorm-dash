import { Text, TextInput, View,StyleSheet, Alert } from "react-native";
export default  function loginStyle(){ 
    return StyleSheet.create({
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
   },
   button:{
    margin:10
   }
})
}