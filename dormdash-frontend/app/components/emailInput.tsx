
import { TextInput } from "react-native";
import loginStyle from "./input-style";
type Props={
    onEmailChange:(str:string)=>{

    }
}
export default function EmailInput({onEmailChange}:Props){
    return <TextInput style={loginStyle().input} placeholderTextColor="#6e6e6e" autoComplete="email" onChangeText={newEmail=>onEmailChange(newEmail)} placeholder="email@university.edu"/>
}