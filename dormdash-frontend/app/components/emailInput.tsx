
import { TextInput } from "react-native";
import loginStyle from "./input-style";
type Props={
    onEmailChange:(str:string)=>{

    },
    defaultValue:""
}
export default function EmailInput({onEmailChange,defaultValue}:Props){
    return <TextInput style={loginStyle().input} defaultValue={defaultValue} placeholderTextColor="#6e6e6e" autoComplete="email" onChangeText={newEmail=>onEmailChange(newEmail)} placeholder="email@university.edu"/>
}