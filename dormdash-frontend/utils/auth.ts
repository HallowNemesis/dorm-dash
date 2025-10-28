import * as SecureStore from 'expo-secure-store'
import { Alert } from 'react-native';
const API_BASE = "https://dawn-youthful-disrespectfully.ngrok-free.dev/api/auth";
export async function PostToAPI(path:string, body?:any,onOK?:(response:Response, data:any)=>void, onFail?:(response:Response, data:any)=>void) {
  const response = await fetch(`${API_BASE}/${path}`,{
    method:"POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }
  );
  const data = await response.json();
  if(response.ok){
    if(onOK!=null)
      onOK(response,data);
  }
  else{
    if(onFail!=null){
      onFail(response,data);
    }
  }
  return {response,data}
}
export async function TokenAuth(onOk:()=>void, onFail?:(message:string)=>void) {
  try {
    const token= await SecureStore.getItemAsync("token");
    if (token==null){
      return {message:"No token", ok:false}
    }
    const {response,data} = await PostToAPI("token-auth",
                            {token:token},
                            (response,data)=>onOk(),
                            (response,data)=> onFail?(data.message):()=>{});

    return {message:data.message,ok:response.ok};
    }
    catch (error) {
          Alert.alert("Error", "An error occurred during login");
          console.error("Login Error:", error);
          return {message:"Fatal error", ok: false}
    }
}
export async function Login(email:string, password:string, onOk:()=>void, onFail:(message:string)=>void){
    try {
    const {response,data} = await PostToAPI("login", {email, password:password},(response,data)=>{
      onOk();
       SecureStore.setItem("token",data.token);
    },
    (response,data)=>{
      onFail(data.message)
    });

    return {message:data.message,ok:response.ok};
    }
    catch (error) {
          Alert.alert("Error", "An error occurred during login");
          console.error("Login Error:", error);
          return {message:"Fatal error", ok: false}
    }
}
export async function Logout(onLoggedOut:()=>void){
  await SecureStore.deleteItemAsync("token")
  onLoggedOut();
}
export async function  CreateAcc(name:string,email:string,password:string,onOk:()=>void,onFail:(message:string)=>void) {
    try {
           const {response,data} = await PostToAPI("signup",{name, email, password:password},(response,data)=>{
            onOk();
            SecureStore.setItem("token", data.token);
           },
          (response,data)=>{
            onFail(data.message)
          });
          return {message:data.message,ok:response.ok}
        } catch (error) {
          Alert.alert("Error", "An error occurred during sign up");
          console.error("Sign Up Error:", error);
        return {message:"Fatal error",ok:false};
        }
}