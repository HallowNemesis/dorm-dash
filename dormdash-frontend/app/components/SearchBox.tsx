
import { TextInput } from "react-native";
import loginStyle from "./input-style";
type Props={
    onSearchChange:(str:string)=> void,
    defaultValue: string
}
export default function SearchBox({onSearchChange,defaultValue}:Props){
    return <TextInput style={loginStyle().input} placeholderTextColor="#6e6e6e" onChangeText={newSearch=>(onSearchChange!=null?onSearchChange(newSearch):{})} placeholder="Where do you want to go?"/>
}