import { Button } from "@react-navigation/elements";
import { useState } from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import { Link, useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import EmailInput from "./components/emailInput";
import PasswordInput from "./components/passwordInput";

// ngrok tunnel URL for backend API 
const API_BASE = "https://dawn-youthful-disrespectfully.ngrok-free.dev/api/auth";

const loginStyle = StyleSheet.create({
  title: {
    fontSize: 50,
    fontWeight: "100",
  },
  button: {
    margin: 10,
  },
});

export default function Index() {
  const [email, setEmail] = useState("");
  const [passHash, setPassHash] = useState("");
  const navigation = useNavigation();
  const router = useRouter();
  const local = useLocalSearchParams();

  const handleLogin = async () => {
    if (!email || !passHash) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: passHash }),
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert("Login Success", `Welcome back, ${data.user?.name || "User"}!`);
        router.push({ pathname: "/", params: { email } });
      } else {
        Alert.alert("Login Failed", data.message || "Invalid email or password");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred during login");
      console.error("Login Error:", error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginBottom: "80%" }}>
      <Text style={loginStyle.title}>Login</Text>
      <EmailInput defaultValue={local.email as string} onEmailChange={setEmail} />
      <PasswordInput onPassChange={setPassHash} />
      <Text>
        Forgot password? Click{" "}
        <Link href={{ pathname: "/forgot-password", params: { email } }}>here</Link>
      </Text>
      <View style={{ display: "flex", flexDirection: "row" }}>
        <Button style={loginStyle.button} onPress={handleLogin}>
          Login
        </Button>
        <Button
          style={loginStyle.button}
          onPress={() => router.push({ pathname: "/signUp", params: { email } })}
        >
          Sign up
        </Button>
      </View>
    </View>
  );
}
