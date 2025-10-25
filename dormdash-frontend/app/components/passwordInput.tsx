import { TextInput } from "react-native";
import loginStyle from "./input-style";
type Props={
    onPassChange:(str:string)=>{

    }
}
export default function PasswordInput({onPassChange}:Props){
    return <TextInput style={loginStyle().input} importantForAutofill="yes" enterKeyHint="done" enablesReturnKeyAutomatically={false} autoComplete="current-password" onChangeText={
            //Eventually this should use some sort of hashing function, but i can't find a modern solution for react native (short of building our own..)
            // I tried bcrypt and similar libraries, but they are unavailbe for react native.
            newPass=>onPassChange(newPass)
          } secureTextEntry={true}/>
}