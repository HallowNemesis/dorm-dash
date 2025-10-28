import * as SecureStore from 'expo-secure-store'
import { Alert } from 'react-native';
const API_BASE = "https://dawn-youthful-disrespectfully.ngrok-free.dev/api/auth";
type APIProps={
  path:string,
  body?:any,
  onOK?:(response:Response, data:any)=>void,
  onFail?:(response:Response, data:any)=>void
}
export async function PostToAPI(apiProps:APIProps) {
  const response = await fetch(`${API_BASE}/${apiProps.path}`,{
    method:"POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(apiProps.body)
  }
  );
  const data = await response.json();
  if(response.ok){
    if(apiProps.onOK!=null)
      apiProps.onOK(response,data);
  }
  else{
    if(apiProps.onFail!=null){
      apiProps.onFail(response,data);
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
    const {response,data} = await PostToAPI({path:"token-auth",
                            body:{token:token},
                            onOK:(response,data)=>onOk(),
                            onFail:(response,data)=> onFail?(data.message):()=>{}});

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
    const {response,data} = await PostToAPI({path:"login", 
                                            body:{email, password:password},
                                            onOK: (response,data)=>{
                                                    onOk();
                                                    SecureStore.setItem("token",data.token);
                                            },
                                            onFail:(response,data)=>{
                                                onFail(data.message)
                                            }});
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
           const {response,data} = await PostToAPI({path:"signup",
                                                    body:{name, email, password:password},
                                                    onOK:(response,data)=>{
                                                      onOk();
                                                      SecureStore.setItem("token", data.token);
                                                    },
                                                    onFail:(response,data)=>{
                                                      onFail(data.message)
                                                    }});
          return {message:data.message,ok:response.ok}
        } catch (error) {
          Alert.alert("Error", "An error occurred during sign up");
          console.error("Sign Up Error:", error);
        return {message:"Fatal error",ok:false};
        }
}