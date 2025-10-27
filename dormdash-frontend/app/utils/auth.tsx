import * as SecureStore from 'expo-secure-store'
import { Alert } from 'react-native';
const API_BASE = "https://dawn-youthful-disrespectfully.ngrok-free.dev/api/auth";
export async function Login(email:string, password:string, onOk:()=>void, onFail:(message:string)=>void){
    try {
    const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: password }),
      });
    const data = await response.json();
    if(response.ok){
        onOk();
        await SecureStore.setItem("email",email);
        await SecureStore.setItem("password",password);
    }else{
        onFail(data.message);
    }
    return {message:data.message,ok:response.ok};
    }
    catch (error) {
          Alert.alert("Error", "An error occurred during login");
          console.error("Login Error:", error);
          return {message:"Fatal error", ok: false}
    }
}
export async function  CreateAcc(name:string,email:string,password:string,onOk:()=>void,onBad:(message:string)=>void) {
    try {
          const response = await fetch(`${API_BASE}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password: password }),
          });
          const data = await response.json();
    
          if (response.ok) {
            onOk();
             await SecureStore.setItem("email",email);
            await SecureStore.setItem("password",password);
          } else {
            onBad(data.message);
          }
          return {message:data.message,ok:response.ok}
        } catch (error) {
          Alert.alert("Error", "An error occurred during sign up");
          console.error("Sign Up Error:", error);
        return {message:"Fatal error",ok:false};
        }
}