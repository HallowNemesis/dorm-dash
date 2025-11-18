import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import { getUserInfo } from "./useAuthUser";

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ??
  "https://dawn-youthful-disrespectfully.ngrok-free.dev/api";

type APIProps = {
  path: string;
  body?: any;
  method?: "GET" | "POST" | "DELETE";
  auth?: boolean;
  onOK?: (response: Response, data: any) => void;
  onFail?: (response: Response, data: any) => void;
};

async function getAuthHeaderIfNeeded(auth?: boolean) {
  if (!auth) return {};
  const token = await SecureStore.getItemAsync("token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function PostToAPI(apiProps: APIProps) {
  const { path, body, method = "POST", auth = false } = apiProps;
  const extraHeaders = await getAuthHeaderIfNeeded(auth);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(extraHeaders as Record<string, string>),
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (method === "POST" || method==="DELETE") {
    options.body = JSON.stringify(body ?? {});
  }

  const response = await fetch(`${API_BASE}/${path}`, options);

  let data: any = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.ok) {
    apiProps.onOK && apiProps.onOK(response, data);
  } else {
    apiProps.onFail && apiProps.onFail(response, data);
  }

  return { response, data };
}

export async function TokenAuth(
  onOk: () => void,
  onFail?: (message: string) => void
) {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (token == null) {
      return { message: "No token", ok: false };
    }
    const { response, data } = await PostToAPI({
      path: "auth/token-auth",
      body: { token },
      onOK: () => onOk(),
      onFail: (_, d) => onFail && onFail(d.message ?? "Token invalid"),
    });

    return { message: data.message, ok: response.ok };
  } catch (error) {
    Alert.alert("Error", "An error occurred during login");
    console.error("TokenAuth  Error:", error);
    return { message: "Fatal error", ok: false };
  }
}

export async function Login(
  email: string,
  password: string,
  onOk: () => void,
  onFail: (message: string) => void
) {
  try {
    const { response, data } = await PostToAPI({
      path: "auth/login",
      body: { email, password },
      onOK: async (_, d) => {
        await SecureStore.setItemAsync("token", d.token);
        onOk();
      },
      onFail: (_, d) => {
        onFail(d.message ?? "Login failed");
      },
    });
    return { message: data.message, ok: response.ok };
  } catch (error) {
    Alert.alert("Error", "An error occurred during login");
    console.error("Login Error:", error);
    return { message: "Fatal error", ok: false };
  }
}
export async function Logout(onLoggedOut: () => void) {
  await SecureStore.deleteItemAsync("token");
  onLoggedOut();
}

export async function CreateAcc(
  name: string,
  email: string,
  password: string,
  onOk: () => void,
  onFail: (message: string) => void
) {
  try {
    const { response, data } = await PostToAPI({
      path: "auth/signup",
      body: { name, email, password },
      onOK: async (_, d) => {
        await SecureStore.setItem("token", d.token);
        onOk();
      },
      onFail: (_, d) => {
        onFail(d.error ?? d.message ?? "Sign up failed");
      },
    });
    return { message: data.message ?? data.error, ok: response.ok };
  } catch (error) {
    Alert.alert("Error", "An error occurred during sign up");
    console.error("Sign Up Error:", error);
    return { message: "Fatal error", ok: false };
  }
}

export async function ResetPassword(
  email: string,
  onOk: () => void,
  onFail: (msg: string) => void
) {
  try {
    const { response, data } = await PostToAPI({
      path: "auth/reset-password-request",
      body: { email },
      onOK: () => onOk(),
      onFail: (_, d) =>
        onFail(d.message ?? d.error ?? "Failed to send reset link"),
    });

    return { message: data.message, ok: response.ok };
  } catch (error) {
    Alert.alert("Error", "An error occurred while resetting password");
    console.error("Reset Password Error:", error);
    return { message: "Fatal error", ok: false };
  }
}

export async function ConfirmResetPassword(
  token: string,
  newPassword: string,
  onOk: () => void,
  onFail: (msg: string) => void
) {
  try {
    const { response, data } = await PostToAPI({
      path: "auth/reset-password-confirm",
      body: { token, newPassword },
      onOK: () => onOk(),
      onFail: (_, d) => onFail(d.message ?? "Failed to reset password"),
    });

    return { message: data.message, ok: response.ok };
  } catch (error) {
    Alert.alert("Error", "An error occurred while confirming password reset");
    console.error("Confirm Password Reset Error:", error);
    return { message: "Fatal error", ok: false };
  }
}

export async function getProfile() {
  const { response, data } = await PostToAPI({
    path: "profile/me",
    method: "GET",
    auth: true,
  });

  return { ok: response.ok, data };
}

export async function updateProfile(
  profile: {
    full_name: string;
    phone?: string;
    bio?: string;
    avatar_url?: string | null;
    role: "rider" | "driver";
  },
  onOk: () => void,
  onFail: (msg: string) => void
) {
  const { response, data } = await PostToAPI({
    path: "profile/me",
    method: "POST",
    auth: true,
    body: profile,
    onOK: () => onOk(),
    onFail: (_, d) => onFail(d.message ?? "Failed to update profile"),
  });

  return { ok: response.ok, data };
}

export async function  deleteProfile(
  onOK:()=>void,
  onFail:(msg: string)=>void
) {
  const info = getUserInfo();
  const {response, data} = await PostToAPI({
    path:"profile/me",
    method:"DELETE",
    auth:true,
    body:{user:info},
    onOK: ()=>onOK(),
     onFail: (_, d) => onFail(d.message ?? "Failed to delete profile")
})
  return{ok:response.ok,data}
}